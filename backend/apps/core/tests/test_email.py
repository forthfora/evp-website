from __future__ import annotations

from unittest.mock import patch

from django.test import TestCase, override_settings

from apps.core.email import send_email, send_otp_email


class EmailServiceTests(TestCase):
    """Tests for the core email service module."""

    @override_settings(DEBUG=True)
    @patch("apps.core.email.logger")
    def test_send_otp_email_logs_in_debug_mode(self, mock_logger) -> None:
        """In DEBUG mode, send_otp_email logs the code instead of sending."""
        send_otp_email("test@example.com", "123456")
        mock_logger.info.assert_called_once()
        args = mock_logger.info.call_args[0]
        # logger.info uses lazy %s formatting, so args are (fmt, *values)
        all_text = " ".join(str(a) for a in args)
        self.assertIn("123456", all_text)
        self.assertIn("test@example.com", all_text)

    @override_settings(DEBUG=True)
    @patch("apps.core.email.logger")
    def test_send_email_logs_in_debug_mode(self, mock_logger) -> None:
        """In DEBUG mode, send_email logs instead of sending."""
        send_email(
            to="test@example.com",
            subject="Test Subject",
            body="Test body content",
        )
        mock_logger.info.assert_called_once()
        args = mock_logger.info.call_args[0]
        # logger.info uses lazy %s formatting, so args are (fmt, *values)
        all_text = " ".join(str(a) for a in args)
        self.assertIn("Test Subject", all_text)
        self.assertIn("test@example.com", all_text)

    @override_settings(DEBUG=False)
    @patch("apps.core.email.resend.Emails.send")
    def test_send_otp_email_calls_resend_in_production(self, mock_send) -> None:
        """In non-DEBUG mode, send_otp_email calls the Resend API."""
        send_otp_email("test@example.com", "123456")
        mock_send.assert_called_once()
        params = mock_send.call_args[1]["params"]
        self.assertEqual(params["to"], ["test@example.com"])
        self.assertIn("123456", params["html"])

    @override_settings(DEBUG=False)
    @patch("apps.core.email.resend.Emails.send")
    def test_send_email_calls_resend_in_production(self, mock_send) -> None:
        """In non-DEBUG mode, send_email calls the Resend API."""
        send_email(
            to="recipient@example.com",
            subject="Hello",
            body="This is the body.",
        )
        mock_send.assert_called_once()
        params = mock_send.call_args[1]["params"]
        self.assertEqual(params["to"], ["recipient@example.com"])
        self.assertEqual(params["subject"], "Hello")
        self.assertIn("This is the body.", params["html"])
