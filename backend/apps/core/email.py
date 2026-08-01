from __future__ import annotations

import logging

from django.conf import settings

logger = logging.getLogger(__name__)

try:
    import resend

    resend.api_key = settings.RESEND_API_KEY
except ImportError:
    resend = None  # type: ignore[assignment]
    logger.warning("resend package not installed: emails will be logged only")


class EmailSendError(Exception):
    """Raised when an email fails to send, for any reason."""


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
    to: str | list[str],
    subject: str,
    body: str,
    *,
    from_email: str | None = None,
):
    """Send an email via Resend, or log it when sending is disabled.
    Args:
        to: Recipient email address(es). A single string or a list of strings.
        subject: Email subject line.
        body: Plain-text or HTML body content.
        from_email: Sender address (defaults to ``settings.FROM_EMAIL``).

    Raises:
        EmailSendError: If the email API fails to load or send the email.
    """
    sender = from_email or settings.FROM_EMAIL
    recipients = [to] if isinstance(to, str) else to

    if not settings.RESEND_ENABLED:
        logger.info(
            "[LOG-ONLY EMAIL] To: %s | Subject: %s | Body:\n%s",
            ", ".join(recipients),
            subject,
            body,
        )
        return

    print("Sending email via Resend.")
    try:
        if resend is None:
            raise ValueError("Resend API is missing.")

        resend.Emails.send(
            params={
                "from": sender,
                "to": recipients,
                "subject": subject,
                "html": body,
            }
        )

    except Exception as err:
        logger.error("Failed to send email via Resend: %s", err)
        raise EmailSendError(err) from err


def send_otp_email(email: str, code: str):
    """Send a one-time passcode email.

    Args:
        email: The recipient's email address.
        code: The 6-digit numeric code to include.

    Raises:
        EmailSendError: If the email API fails to load or send the email.
    """
    html_body = _build_otp_html(code)
    return send_email(
        to=email,
        subject="Your EVP verification code",
        body=html_body,
    )
