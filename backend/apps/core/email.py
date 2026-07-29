from __future__ import annotations

import logging
from dataclasses import dataclass

from django.conf import settings

logger = logging.getLogger(__name__)

try:
    import resend

    resend.api_key = settings.RESEND_API_KEY
except ImportError:
    resend = None  # type: ignore[assignment]
    logger.warning("resend package not installed: emails will be logged only")


# record class
@dataclass
class EmailResult:
    """Lightweight result wrapper for sent emails."""

    success: bool
    message: str


def _build_otp_html(code: str) -> str:
    """Build a minimal HTML email body for an OTP code."""
    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; padding: 2rem;">
    <h1>Hello!</h1>
    <p>We're sending you this as you requested a verification code for your Edinburgh VenturePoint account.</p>
    <h2>Here's your code:</h2>
    <p style="font-size: 1.5rem; font-weight: bold; letter-spacing: 0.25em;">
        {code}
    </p>
    <p><b>Do not forward or share this code with anyone else as it may allow people to access your account.</b><p>
    <p>This code expires in 10 minutes.</p>
    <p>If you didn't request this, you can safely ignore and delete this email.</p>


    <p>Kind regards,<br>The Edinburgh VenturePoint team</p>
</body>
</html>
"""  # noqa: E501


def send_email(
    to: str,
    subject: str,
    body: str,
    *,
    from_email: str | None = None,
) -> EmailResult:
    """Send an email via Resend, or log it in DEBUG mode.

    Args:
        to: Recipient email address.
        subject: Email subject line.
        body: Plain-text or HTML body content.
        from_email: Sender address (defaults to ``settings.FROM_EMAIL``).

    Returns:
        An ``EmailResult`` with success status and message.
    """
    sender = from_email or settings.FROM_EMAIL

    # DEBUG mode, or if resend fails to load for whatever reason
    if settings.DEBUG or resend is None:
        logger.info(
            "[DEBUG EMAIL] To: %s | Subject: %s | Body:\n%s",
            to,
            subject,
            body,
        )
        return EmailResult(success=True, message="Logged to console (DEBUG mode)")

    try:
        response = resend.Emails.send(
            params={
                "from": sender,
                "to": [to],
                "subject": subject,
                "html": body,
            }
        )
        return EmailResult(success=True, message=f"Sent (id={response['id']})")
    except Exception as exc:
        logger.error("Failed to send email via Resend: %s", exc)
        return EmailResult(success=False, message=str(exc))


def send_otp_email(email: str, code: str) -> EmailResult:
    """Send a one-time passcode email.

    Args:
        email: The recipient's email address.
        code: The 6-digit numeric code to include.

    Returns:
        An ``EmailResult`` indicating success or failure.
    """
    html_body = _build_otp_html(code)
    return send_email(
        to=email,
        subject="Your EVP verification code",
        body=html_body,
    )
