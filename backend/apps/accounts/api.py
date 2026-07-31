from __future__ import annotations

from typing import TYPE_CHECKING

from django.contrib.auth import login, logout
from django.http import HttpResponse
from ninja import Router
from ninja.errors import HttpError, logger
from ninja.security import django_auth

from apps.accounts.models import EmailOTP, User
from apps.accounts.schemas import (
    MemberOut,
    MeOut,
    RequestOTPIn,
    SendAllEmailIn,
    SendAllEmailOut,
    VerifyOTPIn,
)
from apps.core.email import EmailSendError, send_email, send_otp_email
from apps.core.permissions import RoleAuth

if TYPE_CHECKING:
    from django.http import HttpRequest

router = Router(tags=["Accounts"])


@router.post(
    "/otp/request",
    auth=None,
    response={204: None, 500: None},
    summary="Sends a new OTP to the provided email.",
)
def request_otp(request, payload: RequestOTPIn):
    otp = EmailOTP.objects.create(email=payload.email)

    try:
        send_otp_email(payload.email, otp.code)

    except EmailSendError as err:
        logger.exception("Failed to send OTP email")
        raise HttpError(
            500,
            "An unexpected error occured. Our email server may be down. Please try again later.",  # noqa: E501
        ) from err

    return HttpResponse(status=204)


@router.post(
    "/otp/verify",
    auth=None,
    response={204: None, 401: None},
    summary="Verifies the provided OTP code.",
)
def verify_otp(request, payload: VerifyOTPIn):
    otp = (
        EmailOTP.objects.filter(email=payload.email, consumed=False)
        .order_by("-created_at")
        .first()
    )

    if otp is None:
        raise HttpError(401, "Invalid or expired OTP.")

    ok = otp.try_consume(payload.code)

    if not ok:
        raise HttpError(401, "Invalid or expired OTP.")

    user, _ = User.objects.get_or_create(email=payload.email)

    login(request, user)

    return HttpResponse(status=204)


@router.post(
    "/logout",
    auth=django_auth,
    response={204: None, 401: None},
    summary="Logs the authenticated user out.",
)
def logout_view(request):
    logout(request)
    return HttpResponse(status=204)


@router.get(
    "/me",
    auth=django_auth,
    response={200: MeOut, 401: None},
    summary="Returns the authenticated user's profile.",
)
def accounts_me(request: HttpRequest) -> MeOut:
    user: User = request.user  # type: ignore
    return MeOut(
        email=user.email,
        role=user.role,
        date_joined=user.date_joined.isoformat(),
    )


@router.get(
    "/members",
    auth=RoleAuth("admin", "committee"),
    response={200: list[MemberOut], 401: None, 403: None},
    summary="Lists all members. (admin or committee)",
)
def list_members(request: HttpRequest) -> list[MemberOut]:
    users = User.objects.all().order_by("email")
    return [
        MemberOut(
            id=u.id,
            email=u.email,
            role=u.role,
            date_joined=u.date_joined.isoformat(),
            receives_update_emails=u.receives_update_emails,
        )
        for u in users
    ]


@router.post(
    "/sendall",
    auth=RoleAuth("admin"),
    response={200: SendAllEmailOut, 401: None, 403: None},
    summary="Send an email to all opted-in members. (admin)",
)
def send_all_members_email(
    request: HttpRequest, payload: SendAllEmailIn
) -> SendAllEmailOut:
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
                body=payload.body,
            )
            sent += 1

        except EmailSendError:
            logger.exception("Failed to send email.")
            failed += 1

    return SendAllEmailOut(
        subject=payload.subject,
        body=payload.body,
        sent=sent,
        skipped=skipped,
        failed=failed,
    )
