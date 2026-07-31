from __future__ import annotations

from datetime import timedelta
from unittest.mock import patch

from django.test import TestCase
from django.utils import timezone

from apps.accounts.models import EmailOTP, User
from apps.core.email import EmailSendError


class RequestOTPTests(TestCase):
    """Tests for POST /api/accounts/otp/request."""

    url = "/api/accounts/otp/request"

    def _request_code(self, email: str):
        return self.client.post(
            self.url,
            {"email": email},
            content_type="application/json",
        )

    @patch("apps.accounts.api.send_otp_email")
    def test_request_code_returns_204(self, mock_send) -> None:
        """A valid request returns 204 No Content."""
        response = self._request_code("test@example.com")
        assert response.status_code == 204

    @patch("apps.accounts.api.send_otp_email")
    def test_request_code_creates_otp_record(self, mock_send) -> None:
        """request-code creates an EmailOTP record."""
        assert EmailOTP.objects.count() == 0
        self._request_code("test@example.com")
        assert EmailOTP.objects.count() == 1

    @patch("apps.accounts.api.send_otp_email")
    def test_request_code_calls_send_otp_email(self, mock_send) -> None:
        """request-code calls send_otp_email with the email and a 6-digit code."""
        self._request_code("test@example.com")
        mock_send.assert_called_once()
        email, code = mock_send.call_args[0]
        assert email == "test@example.com"
        assert len(code) == 6
        assert code.isdigit()

    @patch("apps.accounts.api.send_otp_email")
    def test_request_code_returns_204_for_existing_user(self, mock_send) -> None:
        """request-code returns 204 for existing users too (no enumeration)."""
        User.objects.create_user("existing@example.com")
        response = self._request_code("existing@example.com")
        assert response.status_code == 204

    @patch("apps.accounts.api.send_otp_email")
    def test_request_code_returns_204_for_unknown_email(self, mock_send) -> None:
        """Unknown emails get 204 so accounts cannot be enumerated."""
        response = self._request_code("nobody@example.com")
        assert response.status_code == 204

    @patch("apps.accounts.api.send_otp_email")
    def test_request_code_returns_500_when_email_fails(self, mock_send) -> None:
        """If sending the OTP email fails, a 500 is returned."""
        mock_send.side_effect = EmailSendError("smtp down")
        response = self._request_code("test@example.com")
        assert response.status_code == 500


class VerifyOTPTests(TestCase):
    """Tests for POST /api/accounts/otp/verify."""

    url = "/api/accounts/otp/verify"
    request_url = "/api/accounts/otp/request"
    me_url = "/api/accounts/me"

    def _request_code(self, email: str) -> str:
        """Request a code and return the 6-digit code that was 'sent'."""
        with patch("apps.accounts.api.send_otp_email") as mock_send:
            resp = self.client.post(
                self.request_url,
                {"email": email},
                content_type="application/json",
            )
            assert resp.status_code == 204
            return mock_send.call_args[0][1]

    def _verify(self, email: str, code: str):
        return self.client.post(
            self.url,
            {"email": email, "code": code},
            content_type="application/json",
        )

    def test_verify_code_creates_user_and_logs_in(self) -> None:
        """verify-code with a correct code creates the user and starts a session."""
        email = "newuser@example.com"
        code = self._request_code(email)

        response = self._verify(email, code)
        assert response.status_code == 204

        user = User.objects.get(email=email)
        assert user.role == "member"
        assert not user.has_usable_password()

        me = self.client.get(self.me_url)
        assert me.status_code == 200
        assert me.json()["email"] == email

    def test_verify_code_signs_in_existing_user(self) -> None:
        """verify-code signs in an existing user without creating a duplicate."""
        email = "existing@example.com"
        User.objects.create_user(email)
        code = self._request_code(email)

        response = self._verify(email, code)
        assert response.status_code == 204
        assert User.objects.filter(email=email).count() == 1
        assert self.client.get(self.me_url).json()["email"] == email

    def test_verify_code_with_wrong_code_returns_401(self) -> None:
        """verify-code returns 401 for an incorrect code."""
        email = "wrong@example.com"
        code = self._request_code(email)
        wrong = str((int(code) + 1) % 1_000_000).zfill(6)

        response = self._verify(email, wrong)
        assert response.status_code == 401

    def test_verify_code_with_expired_code_returns_401(self) -> None:
        """verify-code returns 401 for an expired code."""
        email = "expired@example.com"
        code = self._request_code(email)

        otp = EmailOTP.objects.get(email=email)
        otp.expires_at = timezone.now() - timedelta(minutes=1)
        otp.save()

        response = self._verify(email, code)
        assert response.status_code == 401

    def test_verify_code_with_consumed_code_returns_401(self) -> None:
        """verify-code returns 401 when the code was already used."""
        email = "reuse@example.com"
        code = self._request_code(email)

        assert self._verify(email, code).status_code == 204
        assert self._verify(email, code).status_code == 401

    def test_verify_code_with_no_prior_otp_returns_401(self) -> None:
        """verify-code returns 401 when no OTP was requested."""
        response = self._verify("no_otp@example.com", "123456")
        assert response.status_code == 401

    def test_verify_code_max_attempts_lockout(self) -> None:
        """After max failed attempts, even the correct code is rejected."""
        email = "lockout@example.com"
        code = self._request_code(email)
        wrong = str((int(code) + 1) % 1_000_000).zfill(6)

        for _ in range(5):
            self._verify(email, wrong)

        response = self._verify(email, code)
        assert response.status_code == 401


class MeEndpointTests(TestCase):
    """Tests for GET /api/accounts/me."""

    url = "/api/accounts/me"

    def test_me_authenticated(self) -> None:
        """Authenticated request to /api/accounts/me returns the user profile."""
        user = User.objects.create_user("me-test@example.com")
        self.client.force_login(user)

        response = self.client.get(self.url)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "me-test@example.com"
        assert data["role"] == "member"
        assert "date_joined" in data

    def test_me_unauthenticated_returns_401(self) -> None:
        """Unauthenticated request to /api/accounts/me returns 401."""
        response = self.client.get(self.url)
        assert response.status_code == 401

    def test_me_requires_active_session(self) -> None:
        """A request with no session cookie is treated as unauthenticated."""
        User.objects.create_user("other@example.com")
        response = self.client.get(self.url)
        assert response.status_code == 401


class LogoutTests(TestCase):
    """Tests for POST /api/accounts/logout."""

    url = "/api/accounts/logout"
    me_url = "/api/accounts/me"

    def test_logout_authenticated_returns_204(self) -> None:
        """An authenticated user can log out and gets 204."""
        user = User.objects.create_user("logout@example.com")
        self.client.force_login(user)

        response = self.client.post(self.url)
        assert response.status_code == 204

    def test_logout_clears_session(self) -> None:
        """After logout the session is gone and /me returns 401."""
        user = User.objects.create_user("logout@example.com")
        self.client.force_login(user)
        assert self.client.get(self.me_url).status_code == 200

        self.client.post(self.url)
        assert self.client.get(self.me_url).status_code == 401

    def test_logout_unauthenticated_returns_401(self) -> None:
        """Logging out without a session returns 401."""
        response = self.client.post(self.url)
        assert response.status_code == 401
