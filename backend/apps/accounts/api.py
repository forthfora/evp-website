from __future__ import annotations

import time

from django.http import HttpRequest, HttpResponse, JsonResponse
from django.utils import timezone
from jwt_ninja.auth_classes import JWTAuth
from ninja import Router, Schema

from apps.accounts.models import EmailOTP, User
from apps.core.email import send_otp_email
from apps.core.permissions import require_role

router = Router(tags=["Authentication"])


class RequestCodeInput(Schema):
    email: str


class VerifyCodeInput(Schema):
    email: str
    code: str


class AuthResponse(Schema):
    access: str


class ErrorResponse(Schema):
    detail: str


class MeResponse(Schema):
    email: str
    role: str
    date_joined: str


class MemberOut(Schema):
    id: int
    email: str
    role: str
    image: str
    date_joined: str
    receives_update_emails: bool


def _issue_tokens(user: User) -> tuple[str, str]:
    """Issue a new access+refresh token pair for *user* using jwtninja.

    Mirrors the token-creation logic from ``jwt_ninja.api.login`` so
    the standard refresh / logout endpoints continue to work.
    """
    from jwt_ninja import settings as jwt_settings
    from jwt_ninja.cryptography import generate_jwt
    from jwt_ninja.models import Session

    session = Session.create_session(
        user=user,
        ip_address="",  # not available during OTP flow
    )

    now = int(time.time())
    payload_cls = jwt_settings.jwt_settings.payload_class

    access_payload = payload_cls(
        user_id=user.id,
        type="access",
        exp=now + jwt_settings.jwt_settings.ACCESS_TOKEN_EXPIRE_SECONDS,
        session_id=session.id,
    )
    access_token = generate_jwt(access_payload)

    refresh_payload = payload_cls(
        user_id=user.id,
        type="refresh",
        exp=now + jwt_settings.jwt_settings.REFRESH_TOKEN_EXPIRE_SECONDS,
        session_id=session.id,
    )
    refresh_token = generate_jwt(refresh_payload)

    return access_token, refresh_token


def _set_refresh_cookie(response: HttpResponse, refresh_token: str) -> None:
    """Set the refresh token as an HttpOnly, Secure, SameSite=Lax cookie.

    Uses the same cookie settings as jwtninja so the existing refresh
    endpoint can consume it.
    """
    from jwt_ninja import settings as jwt_settings

    response.set_cookie(
        key=jwt_settings.jwt_settings.REFRESH_COOKIE_NAME,
        value=refresh_token,
        max_age=jwt_settings.jwt_settings.REFRESH_TOKEN_EXPIRE_SECONDS,
        path=jwt_settings.jwt_settings.REFRESH_COOKIE_PATH,
        domain=jwt_settings.jwt_settings.REFRESH_COOKIE_DOMAIN,
        secure=jwt_settings.jwt_settings.REFRESH_COOKIE_SECURE,
        httponly=True,
        samesite=jwt_settings.jwt_settings.REFRESH_COOKIE_SAMESITE,
    )


@router.post(
    "/auth/request-code",
    response={202: None, 429: ErrorResponse, 422: ErrorResponse},
    auth=None,
    summary="Request a one-time verification code",
)
def request_code(request: HttpRequest, payload: RequestCodeInput) -> HttpResponse:
    """Send a 6-digit OTP to *email*. Always returns 202 to prevent
    user enumeration. The email is sent only if the address is valid."""

    now = timezone.now()
    latest_otp = (
        EmailOTP.objects.filter(email=payload.email).order_by("-created_at").first()
    )
    if (
        latest_otp
        and (now - latest_otp.created_at).total_seconds() < latest_otp.cooldown_seconds
    ):
        return JsonResponse(
            {
                "detail": "Too many requests. Please wait before requesting another code."  # noqa: E501
            },
            status=429,
        )

    code = EmailOTP.generate_code()
    otp = EmailOTP.objects.create(email=payload.email)
    otp.set_code(code)
    otp.save()  # persist the code_hash and expires_at

    send_otp_email(payload.email, code)
    return HttpResponse(status=202)


@router.post(
    "/auth/verify-code",
    response={200: AuthResponse, 400: ErrorResponse},
    auth=None,
    summary="Verify a one-time code and obtain JWT tokens",
)
def verify_code(request: HttpRequest, payload: VerifyCodeInput) -> HttpResponse:
    """Validate *code* for *email*, create a User if one doesn't exist,
    and return JWT access + refresh tokens."""
    # Find the most recent unconsumed OTP for this email
    otp = (
        EmailOTP.objects.filter(email=payload.email, consumed_at=None)
        .order_by("-created_at")
        .first()
    )

    if otp is None or not otp.is_valid:
        return JsonResponse(
            {"detail": "Invalid or expired verification code."},
            status=400,
        )

    if not otp.consume(payload.code):
        return JsonResponse(
            {"detail": "Invalid or expired verification code."},
            status=400,
        )

    # Get or create the user
    user, created = User.objects.get_or_create(
        email=payload.email,
        defaults={"username": payload.email},
    )

    if created:
        user.set_unusable_password()
        user.save(update_fields=["password"])

    access_token, refresh_token = _issue_tokens(user)

    response = JsonResponse({"access": access_token})
    _set_refresh_cookie(response, refresh_token)
    return response


@router.get(
    "/accounts/me",
    response={200: MeResponse},
    auth=JWTAuth(),
    summary="Return the authenticated user's profile",
)
def accounts_me(request: HttpRequest) -> MeResponse:
    """Return the current user's email, role, and join date."""
    user: User = request.auth.user  # type: ignore[union-attr]
    return MeResponse(
        email=user.email,
        role=user.role,
        date_joined=user.date_joined.isoformat(),
    )


@router.get(
    "/accounts/members",
    response=list[MemberOut],
    auth=require_role("committee", "admin"),
    summary="List all members (committee/admin only)",
)
def list_members(request: HttpRequest) -> list[MemberOut]:
    """Return all registered users.  Only available to committee and admin."""
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
