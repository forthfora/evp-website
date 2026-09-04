from unittest.mock import patch

from django.test import Client, TestCase, override_settings


class ContactEndpointTests(TestCase):
    """Tests for POST /api/contact."""

    def _post(self, payload: dict):
        return Client().post(
            "/api/contact", data=payload, content_type="application/json"
        )

    @override_settings(RESEND_ENABLED=True, TO_EMAILS=["delivered+contact@resend.dev"])
    @patch("apps.core.email.resend.Emails.send")
    def test_contact_sends_email_and_returns_204(self, mock_send) -> None:
        """A valid submission sends an email to the team inbox and returns 204."""
        response = self._post(
            {
                "name": "Alice Smith",
                "email": "alice@example.com",
                "message": "Hello EVP!",
            }
        )

        assert response.status_code == 204
        mock_send.assert_called_once()
        params = mock_send.call_args[1]["params"]
        assert params["to"] == ["delivered+contact@resend.dev"]
        assert params["subject"] == "EVP Contact: Alice Smith"
        assert "Alice Smith" in params["html"]
        assert "alice@example.com" in params["html"]
        assert "Hello EVP!" in params["html"]

    @override_settings(RESEND_ENABLED=True, TO_EMAILS=["delivered+contact@resend.dev"])
    @patch("apps.core.email.resend.Emails.send")
    def test_contact_escapes_html_in_user_supplied_values(self, mock_send) -> None:
        """Name/email/message are HTML-escaped: no raw tags reach the email."""
        response = self._post(
            {
                "name": 'Alice <script>alert("xss")</script>',
                "email": "bob@example.com",
                "message": '<a href="https://evil.example">Click me</a>',
            }
        )

        assert response.status_code == 204
        mock_send.assert_called_once()
        html = mock_send.call_args[1]["params"]["html"]

        # Raw, unescaped markup must not appear in the sent email.
        assert "<script>" not in html
        assert '<a href="https://evil.example">' not in html

        # The values are present, but escaped.
        assert "&lt;script&gt;" in html
        assert "&lt;a href=" in html
        assert "Click me" in html

    @override_settings(RESEND_ENABLED=True, TO_EMAILS=["delivered+contact@resend.dev"])
    @patch("apps.core.email.resend.Emails.send")
    def test_contact_renders_message_newlines_as_line_breaks(self, mock_send) -> None:
        """Newlines in the message become <br> so paragraphs are preserved."""
        response = self._post(
            {
                "name": "Alice Smith",
                "email": "alice@example.com",
                "message": "First line\n\nSecond line",
            }
        )

        assert response.status_code == 204
        html = mock_send.call_args[1]["params"]["html"]
        assert "First line<br><br>Second line" in html

    @override_settings(RESEND_ENABLED=True, TO_EMAILS=["delivered+contact@resend.dev"])
    @patch("apps.core.email.resend.Emails.send")
    def test_contact_subject_collapses_whitespace_in_name(self, mock_send) -> None:
        """Line breaks in the name cannot smuggle headers into the subject."""
        response = self._post(
            {
                "name": "Alice\r\nBcc: victim@evil.example",
                "email": "alice@example.com",
                "message": "Hello",
            }
        )

        assert response.status_code == 204
        subject = mock_send.call_args[1]["params"]["subject"]
        assert "\r" not in subject
        assert "\n" not in subject
        assert subject == "EVP Contact: Alice Bcc: victim@evil.example"

    @override_settings(RESEND_ENABLED=True, TO_EMAILS=["delivered+contact@resend.dev"])
    @patch("apps.core.email.resend.Emails.send", side_effect=Exception("boom"))
    def test_contact_returns_500_when_sending_fails(self, mock_send) -> None:
        """A Resend failure surfaces as a 500 with a JSON detail body."""
        response = self._post(
            {
                "name": "Alice Smith",
                "email": "alice@example.com",
                "message": "Hello",
            }
        )

        assert response.status_code == 500
        assert "detail" in response.json()

    def test_contact_rejects_invalid_email(self) -> None:
        """A malformed email is rejected with 422 and nothing is sent."""
        response = self._post(
            {
                "name": "Alice Smith",
                "email": "not-an-email",
                "message": "Hello",
            }
        )

        assert response.status_code == 422
        assert "email" in response.json()["errors"]
