from unittest.mock import patch

from django.conf import settings
from django.test import TestCase, override_settings

from apps.core.email import send_email, send_otp_email


class EmailServiceTests(TestCase):
    """Tests for the core email service module."""

    def test_resend_disabled_under_test_runner(self) -> None:
        """RESEND_ENABLED is always off when running under the test runner."""
        assert settings.RESEND_ENABLED is False

    @override_settings(RESEND_ENABLED=False)
    @patch("apps.core.email.logger")
    def test_send_otp_email_logs_when_disabled(self, mock_logger) -> None:
        """When Resend is disabled, send_otp_email logs the code instead of sending."""
        send_otp_email("delivered@resend.dev", "123456")
        mock_logger.info.assert_called_once()
        args = mock_logger.info.call_args[0]
        # logger.info uses lazy %s formatting, so args are (fmt, *values)
        all_text = " ".join(str(a) for a in args)
        assert "123456" in all_text
        assert "delivered@resend.dev" in all_text

    @override_settings(RESEND_ENABLED=False)
    @patch("apps.core.email.logger")
    def test_send_email_logs_when_disabled(self, mock_logger) -> None:
        """When Resend is disabled, send_email logs instead of sending."""
        send_email(
            to="delivered+user1@resend.dev",
            subject="Test Subject",
            body="Test body content",
        )
        mock_logger.info.assert_called_once()
        args = mock_logger.info.call_args[0]
        # logger.info uses lazy %s formatting, so args are (fmt, *values)
        all_text = " ".join(str(a) for a in args)
        assert "Test Subject" in all_text
        assert "delivered+user1@resend.dev" in all_text

    @override_settings(RESEND_ENABLED=True)
    @patch("apps.core.email.resend.Emails.send")
    def test_send_otp_email_calls_resend_when_enabled(self, mock_send) -> None:
        """When Resend is enabled, send_otp_email calls the Resend API."""
        send_otp_email("delivered+user2@resend.dev", "123456")
        mock_send.assert_called_once()
        params = mock_send.call_args[1]["params"]
        assert params["to"] == ["delivered+user2@resend.dev"]
        assert "123456" in params["html"]

    @override_settings(RESEND_ENABLED=True)
    @patch("apps.core.email.resend.Emails.send")
    def test_send_email_calls_resend_when_enabled(self, mock_send) -> None:
        """When Resend is enabled, send_email calls the Resend API."""
        send_email(
            to="delivered+user3@resend.dev",
            subject="Hello",
            body="This is the body.",
        )
        mock_send.assert_called_once()
        params = mock_send.call_args[1]["params"]
        assert params["to"] == ["delivered+user3@resend.dev"]
        assert params["subject"] == "Hello"
        assert "This is the body." in params["html"]
