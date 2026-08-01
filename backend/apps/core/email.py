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
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f7; font-family: Arial, Helvetica, sans-serif;">

  <!-- Preheader text (hidden, shows in inbox preview) -->
  <div style="display:none; max-height:0; overflow:hidden;">
    Your Edinburgh VenturePoint verification code is inside.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7; padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">
          <!-- Body -->
          <tr>
            <td style="padding:50px;">
              <p style="margin:0 0 16px; font-size:30px; color:#333333; line-height:1.5;">
                <b>Hello from EVP.</b>
              </p>
              <p style="margin:0 0 16px; font-size:15px; color:#333333; line-height:1.5;">
                We're sending you this because you requested a verification code for your Edinburgh VenturePoint account.
              </p>
              <hr>

              <p style="margin:24px 0 8px; font-size:14px; color:#333333;">
                Here's your code:
              </p>
              <p style="margin:0 0 24px; font-size:28px; font-weight:bold; letter-spacing:0.25em; color:#0b2545; text-align:center; background-color:#f4f4f7; padding:16px; border-radius:6px;">
                {code}
              </p>

              <p style="margin:0 0 16px; font-size:14px; color:#333333; line-height:1.5;">
                <strong>Do not forward or share this code with anyone.</strong> It may allow others to access your account.
              </p>
              <p style="margin:0 0 24px; font-size:14px; color:#333333; line-height:1.5;">
                This code expires in 10 minutes. If you didn't request it, you can safely ignore and delete this email.
              </p>

              <hr>

              <p style="margin:0; font-size:15px; color:#333333;">
                <b>
                Kind Regards,<br>
                The Edinburgh VenturePoint team
                </b>
              </p>

              <!-- Image after signature -->
              <table role="presentation" cellpadding="0" cellspacing="0"">
                <tr>
                  <td>
                    <img
                      src="https://edinburghventurepoint.com/favicon.svg"
                      alt="Edinburgh VenturePoint"
                      width="160"
                      style="display:block; border:0; outline:none; text-decoration:none;"
                    >
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f4f4f7; padding:16px 32px; text-align:center;">
              <p style="margin:0; font-size:11px; color:#999999;">
                Edinburgh VenturePoint is an entrepreneurship and venture capital society at The University of Edinburgh.
              </p>
              <br>
              <p style="margin:0; font-size:11px; color:#999999;">
                &copy; 2026 Edinburgh VenturePoint. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

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
