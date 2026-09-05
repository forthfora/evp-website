import threading

import nh3
from django.contrib.auth import login, logout
from django.db import IntegrityError, connection
from django.db.models import F
from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja import Router
from ninja.errors import HttpError, logger
from ninja.security import django_auth

from apps.accounts.models import EmailOTP, SendAllJob, User, normalize_email
from apps.accounts.schemas import (
    EmailChangeIn,
    MemberOut,
    MeOut,
    MePatchIn,
    RequestOTPIn,
    RequestOTPOut,
    SendAllEmailIn,
    SendAllEmailOut,
    SendAllJobOut,
    VerifyOTPIn,
    VerifyOTPOut,
)
from apps.core.email import EmailSendError, send_email, send_otp_email
from apps.core.permissions import RoleAuth
from apps.core.ratelimit import ratelimit

router = Router(tags=["Accounts"])


@router.post(
    "/otp/request",
    auth=None,
    response={200: RequestOTPOut, 429: None, 500: None},
    summary="Sends an OTP and reports whether an account exists.",
)
@ratelimit(key="ip", rate="5/10m", block=True)
def request_otp(request, payload: RequestOTPIn):
    email = normalize_email(payload.email)

    # Opportunistically purge consumed/expired records so the table
    # doesn't grow forever (no scheduled job needed).
    EmailOTP.cleanup()

    # `iexact` so mixed-case input still matches legacy rows created
    # before emails were normalised.
    exists = User.objects.filter(email__iexact=email).exists()
    _, code = EmailOTP.issue(email)

    try:
        send_otp_email(email, code)

    except EmailSendError as err:
        logger.exception("Failed to send OTP email")
        raise HttpError(
            500,
            "An unexpected error occurred. Our email server may be down. Please try again later.",  # noqa: E501
        ) from err

    return RequestOTPOut(exists=exists)


def _consume_otp(email: str, code: str) -> bool:
    """Consume the most recent unconsumed OTP for `email` using `code`."""
    otp = (
        EmailOTP.objects.filter(email=email, consumed=False)
        .order_by("-created_at")
        .first()
    )
    if otp is None:
        return False
    return otp.try_consume(code)


@router.post(
    "/otp/verify",
    auth=None,
    response={200: VerifyOTPOut, 401: None},
    summary="Verifies the provided OTP code and signs the user in.",
)
@ratelimit(key="ip", rate="10/10m", block=True)
def verify_otp(request, payload: VerifyOTPIn):
    email = normalize_email(payload.email)

    if not _consume_otp(email, payload.code):
        raise HttpError(
            401,
            "We're sorry, looks like that code is either invalid or expired. Try requesting a new one.",  # noqa: E501
        )

    # `iexact` so mixed-case input still matches legacy rows created
    # before emails were normalised.
    user = User.objects.filter(email__iexact=email).first()
    created = user is None

    if user is None:
        try:
            # create_user() sets an unusable password atomically (no brief
            # `password=""` window) and normalises the email.
            user = User.objects.create_user(email)
        except IntegrityError:
            # A concurrent verify of the same new email created the
            # account first — use that row instead of failing with a 500.
            user = User.objects.filter(email__iexact=email).first()
            if user is None:
                raise
            created = False

    login(request, user)

    return VerifyOTPOut(created=created)


@router.post(
    "/logout",
    auth=django_auth,
    response={204: None, 401: None},
    summary="Logs the authenticated user out.",
)
@ratelimit(key="user_or_ip", rate="60/m", block=True)
def logout_view(request):
    logout(request)
    return HttpResponse(status=204)


def _me_out(user: User) -> MeOut:
    return MeOut(
        username=user.username,
        email=user.email,
        role=user.role,
        date_joined=user.date_joined.isoformat(),
        first_name=user.first_name,
        last_name=user.last_name,
        receives_update_emails=user.receives_update_emails,
    )


@router.get(
    "/me",
    auth=django_auth,
    response={200: MeOut, 401: None},
    summary="Returns the authenticated user's profile.",
)
@ratelimit(key="user_or_ip", rate="120/m", block=True)
def accounts_me(request: HttpRequest):
    user: User = request.user  # type: ignore
    return _me_out(user)


@router.patch(
    "/me",
    auth=django_auth,
    response={200: MeOut, 401: None},
    summary="Updates the authenticated user's profile (names, update-email opt-in).",
)
@ratelimit(key="user_or_ip", rate="60/m", block=True)
def update_me(request: HttpRequest, payload: MePatchIn):
    user: User = request.user  # type: ignore
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(user, field, value)
    user.save()
    return _me_out(user)


@router.post(
    "/email/change",
    auth=django_auth,
    response={200: MeOut, 400: None, 401: None},
    summary="Verifies an OTP for a new email and switches the user's email.",
)
@ratelimit(key="user_or_ip", rate="5/10m", block=True)
def change_email(request: HttpRequest, payload: EmailChangeIn):
    user: User = request.user  # type: ignore
    email = normalize_email(payload.email)

    if not _consume_otp(email, payload.code):
        raise HttpError(
            401, "We're sorry, it looks like your code is either invalid or expired."
        )

    if User.objects.filter(email__iexact=email).exclude(pk=user.pk).exists():
        raise HttpError(400, "We're sorry, that email is already in use.")

    user.email = email
    user.save(update_fields=["email"])
    return _me_out(user)


@router.get(
    "/members",
    auth=RoleAuth("admin", "committee"),
    response={200: list[MemberOut], 401: None, 403: None},
    summary="Lists all members. (admin or committee)",
)
@ratelimit(key="user_or_ip", rate="120/m", block=True)
def list_members(request: HttpRequest):
    users = User.objects.all().order_by("email")
    return [_me_out(u) for u in users]


def _dispatch_update_emails(
    job_id: int, subject: str, body: str, recipients: list[tuple[str, str]]
) -> None:
    """Send an update email to each (email, first_name) recipient, tracking
    progress on the SendAllJob row so the admin UI can report failures.

    Runs in a background thread: per-recipient email round-trips can exceed
    the Gunicorn worker timeout and abort mid-send with a 502, so they must
    not hold the API response open. Recipient data is passed in
    (pre-resolved) so the thread never queries for recipients.
    """
    try:
        for email, first_name in recipients:
            try:
                send_email(
                    to=email,
                    subject=subject,
                    body=body,
                    greeting_name=first_name,
                )
            except EmailSendError:
                logger.exception("Failed to send update email to %s.", email)
                SendAllJob.objects.filter(pk=job_id).update(failed=F("failed") + 1)
            else:
                SendAllJob.objects.filter(pk=job_id).update(sent=F("sent") + 1)
    finally:
        # Mark finished even if the thread dies unexpectedly, so the UI is
        # never left polling a job that will never progress again. (A hard
        # worker kill mid-send is still visible as a job that never
        # finishes — the UI flags those as interrupted.)
        SendAllJob.objects.filter(pk=job_id).update(finished_at=timezone.now())
        # This thread opened its own database connection; release it.
        connection.close()


def _job_out(job: SendAllJob) -> SendAllJobOut:
    return SendAllJobOut(
        id=job.id,
        subject=job.subject,
        total=job.total,
        sent=job.sent,
        failed=job.failed,
        created_at=job.created_at,
        finished_at=job.finished_at,
    )


@router.post(
    "/sendall",
    auth=RoleAuth("admin"),
    response={200: SendAllEmailOut, 401: None, 403: None},
    summary="Queue an email to all opted-in members for background delivery. (admin)",
)
@ratelimit(key="user_or_ip", rate="3/10m", block=True)
def send_all_members_email(request: HttpRequest, payload: SendAllEmailIn):
    # The body is admin-authored HTML (rendered from Markdown in the admin
    # UI and sanitised there with DOMPurify). Sanitise server-side anyway:
    # the API can be called directly, and a compromised admin account must
    # not be able to inject scripts/unsafe markup into member inboxes.
    safe_body = nh3.clean(payload.body)

    # Snapshot recipients (and their greeting names) up front — one query
    # instead of one greeting lookup per recipient, and the worker thread
    # stays database-free for reads.
    recipients = list(
        User.objects.filter(receives_update_emails=True).values_list(
            "email", "first_name"
        )
    )
    skipped = User.objects.filter(receives_update_emails=False).count()

    user: User = request.user  # type: ignore
    job = SendAllJob.objects.create(
        created_by=user,
        subject=payload.subject,
        total=len(recipients),
    )

    threading.Thread(
        target=_dispatch_update_emails,
        args=(job.pk, payload.subject, safe_body, recipients),
        daemon=True,
        name=f"sendall-job-{job.pk}",
    ).start()

    return SendAllEmailOut(
        subject=payload.subject,
        body=safe_body,
        queued=len(recipients),
        skipped=skipped,
        job_id=job.pk,
    )


@router.get(
    "/sendall/jobs",
    auth=RoleAuth("admin"),
    response={200: list[SendAllJobOut], 401: None, 403: None},
    summary="Lists recent send-all jobs with their delivery results. (admin)",
)
@ratelimit(key="user_or_ip", rate="120/m", block=True)
def list_sendall_jobs(request: HttpRequest):
    jobs = SendAllJob.objects.all()[:20]
    return [_job_out(j) for j in jobs]


@router.get(
    "/sendall/jobs/{job_id}",
    auth=RoleAuth("admin"),
    response={200: SendAllJobOut, 401: None, 403: None, 404: None},
    summary="Returns a send-all job's delivery progress and results. (admin)",
)
@ratelimit(key="user_or_ip", rate="120/m", block=True)
def get_sendall_job(request: HttpRequest, job_id: int):
    job = get_object_or_404(SendAllJob, id=job_id)
    return _job_out(job)
