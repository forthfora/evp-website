from __future__ import annotations

from typing import TYPE_CHECKING

from django.contrib.auth import login, logout
from django.http import HttpResponse
from ninja import Router
from ninja.errors import HttpError, logger
from ninja.security import django_auth

from apps.accounts.models import EmailOTP, User
from apps.accounts.schemas import MemberOut, MeOut, RequestOTPIn, VerifyOTPIn
from apps.core.email import EmailSendError, send_otp_email
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
def request_otp(request, payload: RequestOTPIn) -> HttpResponse:
    otp = EmailOTP.generate(payload.email)

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
def verify_otp(request, payload: VerifyOTPIn) -> HttpResponse:
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
def logout_view(request) -> HttpResponse:
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
    summary="List all members.",
)
def list_members(request: HttpRequest) -> list[MemberOut]:
    users = User.objects.all().order_by("email")
    return [
        MemberOut(
            id=u.id,
            email=u.email,
            role=u.role,
            image=u.image,
            date_joined=u.date_joined.isoformat(),
            receives_update_emails=u.receives_update_emails,
        )
        for u in users
    ]
