import nh3
from django.contrib.auth import login, logout
from django.http import HttpRequest, HttpResponse
from ninja import Router
from ninja.errors import HttpError, logger
from ninja.security import django_auth

from apps.accounts.models import EmailOTP, User
from apps.accounts.schemas import (
    EmailChangeIn,
    MemberOut,
    MeOut,
    MePatchIn,
    RequestOTPIn,
    RequestOTPOut,
    SendAllEmailIn,
    SendAllEmailOut,
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
    email = payload.email

    # Opportunistically purge consumed/expired records so the table
    # doesn't grow forever (no scheduled job needed).
    EmailOTP.cleanup()

    exists = User.objects.filter(email=email).exists()
    _, code = EmailOTP.issue(email)

    try:
        send_otp_email(email, code)

    except EmailSendError as err:
        logger.exception("Failed to send OTP email")
        raise HttpError(
            500,
            "An unexpected error occured. Our email server may be down. Please try again later.",  # noqa: E501
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
    if not _consume_otp(payload.email, payload.code):
        raise HttpError(
            401,
            "We're sorry, looks like that code is either invalid or expired. Try requesting a new one.",  # noqa: E501
        )

    user, created = User.objects.get_or_create(email=payload.email)
    if created:
        user.set_unusable_password()  # passwordless account
        user.save(update_fields=["password"])
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


def _member_out(user: User) -> MemberOut:
    return MemberOut(
        username=user.username,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        date_joined=user.date_joined.isoformat(),
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

    if not _consume_otp(payload.email, payload.code):
        raise HttpError(
            401, "We're sorry, it looks like your code is either invalid or expired."
        )

    if User.objects.filter(email=payload.email).exclude(pk=user.pk).exists():
        raise HttpError(400, "We're sorry, that email is already in use.")

    user.email = payload.email
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
    return [_member_out(u) for u in users]


@router.post(
    "/sendall",
    auth=RoleAuth("admin"),
    response={200: SendAllEmailOut, 401: None, 403: None},
    summary="Send an email to all opted-in members. (admin)",
)
@ratelimit(key="user_or_ip", rate="3/10m", block=True)
def send_all_members_email(request: HttpRequest, payload: SendAllEmailIn):
    # The body is admin-authored HTML (rendered from Markdown in the admin
    # UI and sanitised there with DOMPurify). Sanitise server-side anyway:
    # the API can be called directly, and a compromised admin account must
    # not be able to inject scripts/unsafe markup into member inboxes.
    safe_body = nh3.clean(payload.body)

    sent = 0
    skipped = 0
    failed = 0

    for user in User.objects.iterator():
        if not user.receives_update_emails:
            skipped += 1
            continue

        try:
            send_email(
                to=user.email,
                subject=payload.subject,
                body=safe_body,
            )
            sent += 1

        except EmailSendError:
            logger.exception("Failed to send email.")
            failed += 1

    return SendAllEmailOut(
        subject=payload.subject,
        body=safe_body,
        sent=sent,
        skipped=skipped,
        failed=failed,
    )
