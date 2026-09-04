from datetime import timedelta
from unittest.mock import patch

from django.core.cache import cache
from django.test import TestCase
from django.utils import timezone
from freezegun import freeze_time

from apps.accounts.models import EmailOTP, User, hash_otp_code
from apps.core.email import EmailSendError


class RequestOTPTests(TestCase):
    """Tests for POST /api/accounts/otp/request."""

    url = "/api/accounts/otp/request"

    def setUp(self):
        cache.clear()

    def _request_code(self, email: str):
        return self.client.post(
            self.url,
            {"email": email},
            content_type="application/json",
        )

    @patch("apps.accounts.api.send_otp_email")
    def test_request_code_returns_200_with_exists_false(self, mock_send) -> None:
        """A valid request returns 200 with exists=False for an unknown email."""
        response = self._request_code("delivered+test@resend.dev")
        assert response.status_code == 200
        assert response.json() == {"exists": False}

    @patch("apps.accounts.api.send_otp_email")
    def test_request_code_creates_otp_record(self, mock_send) -> None:
        """request-code creates an EmailOTP record."""
        assert EmailOTP.objects.count() == 0
        self._request_code("delivered+test@resend.dev")
        assert EmailOTP.objects.count() == 1

    @patch("apps.accounts.api.send_otp_email")
    def test_request_code_calls_send_otp_email(self, mock_send) -> None:
        """request-code calls send_otp_email with the email and a 6-digit code."""
        self._request_code("delivered+test@resend.dev")
        mock_send.assert_called_once()
        email, code = mock_send.call_args[0]
        assert email == "delivered+test@resend.dev"
        assert len(code) == 6
        assert code.isdigit()

    @patch("apps.accounts.api.send_otp_email")
    def test_request_code_reports_existing_user(self, mock_send) -> None:
        """request-code reports exists=True for an already-registered email."""
        User.objects.create_user("delivered+existing@resend.dev")
        response = self._request_code("delivered+existing@resend.dev")
        assert response.status_code == 200
        assert response.json() == {"exists": True}

    @patch("apps.accounts.api.send_otp_email")
    def test_request_code_reports_unknown_email(self, mock_send) -> None:
        """Unknown emails are reported as exists=False (drives signup)."""
        response = self._request_code("delivered+nobody@resend.dev")
        assert response.status_code == 200
        assert response.json() == {"exists": False}

    @patch("apps.accounts.api.send_otp_email")
    def test_request_code_returns_500_when_email_fails(self, mock_send) -> None:
        """If sending the OTP email fails, a 500 is returned."""
        mock_send.side_effect = EmailSendError("smtp down")
        response = self._request_code("delivered+test@resend.dev")
        assert response.status_code == 500

    @patch("apps.accounts.api.send_otp_email")
    def test_request_code_cleans_up_stale_otps(self, mock_send) -> None:
        """Requesting a code purges consumed/expired OTP records."""
        with freeze_time(timezone.now() - timedelta(minutes=30)):
            EmailOTP.objects.create(email="delivered+stale@resend.dev")

        used = EmailOTP.objects.create(
            email="delivered+stale@resend.dev", code=hash_otp_code("654321")
        )
        assert used.try_consume("654321") is True

        assert self._request_code("delivered+fresh@resend.dev").status_code == 200

        stale = EmailOTP.objects.exclude(email="delivered+fresh@resend.dev")
        assert stale.count() == 0
        # The freshly created OTP is kept.
        assert EmailOTP.objects.filter(email="delivered+fresh@resend.dev").exists()

    @patch("apps.accounts.api.send_otp_email")
    def test_sixth_request_within_window_is_rate_limited(self, mock_send) -> None:
        """The 6th request within the 10-minute window is rejected with 429."""
        for _ in range(5):
            resp = self._request_code("delivered+throttle@resend.dev")
            assert resp.status_code == 200

        resp = self._request_code("delivered+throttle@resend.dev")
        assert resp.status_code == 429
        # The detail reports the exact time left on the limiter window.
        detail = resp.json()["detail"]
        assert detail.startswith("Too many requests. Please try again")
        assert "shortly" in detail or "minute" in detail or "second" in detail

    @patch("apps.accounts.api.send_otp_email")
    def test_requests_allowed_again_after_window_resets(self, mock_send) -> None:
        """Once the 10-minute window rolls over, requests are allowed again."""
        for _ in range(5):
            resp = self._request_code("delivered+throttle@resend.dev")
            assert resp.status_code == 200
        assert self._request_code("delivered+throttle@resend.dev").status_code == 429

        with freeze_time(timezone.now() + timedelta(minutes=11)):
            resp = self._request_code("delivered+throttle@resend.dev")
            assert resp.status_code == 200


class VerifyOTPTests(TestCase):
    """Tests for POST /api/accounts/otp/verify."""

    url = "/api/accounts/otp/verify"
    request_url = "/api/accounts/otp/request"
    me_url = "/api/accounts/me"

    def setUp(self):
        cache.clear()

    def _request_code(self, email: str) -> str:
        """Request a code and return the 6-digit code that was 'sent'."""
        with patch("apps.accounts.api.send_otp_email") as mock_send:
            resp = self.client.post(
                self.request_url,
                {"email": email},
                content_type="application/json",
            )
            assert resp.status_code == 200
            return mock_send.call_args[0][1]

    def _verify(self, email: str, code: str):
        return self.client.post(
            self.url,
            {"email": email, "code": code},
            content_type="application/json",
        )

    def test_verify_code_creates_user_and_logs_in(self) -> None:
        """verify-code with a correct code creates the user and starts a session."""
        email = "delivered+newuser@resend.dev"
        code = self._request_code(email)

        response = self._verify(email, code)
        assert response.status_code == 200
        assert response.json() == {"created": True}

        user = User.objects.get(email=email)
        assert user.role == "member"
        assert not user.has_usable_password()
        # The stable username ID is auto-generated, never the email.
        assert user.username != email

        me = self.client.get(self.me_url)
        assert me.status_code == 200
        assert me.json()["email"] == email

    def test_verify_code_signs_in_existing_user(self) -> None:
        """verify-code signs in an existing user without creating a duplicate."""
        email = "delivered+existing@resend.dev"
        User.objects.create_user(email)
        code = self._request_code(email)

        response = self._verify(email, code)
        assert response.status_code == 200
        assert response.json() == {"created": False}
        assert User.objects.filter(email=email).count() == 1
        assert self.client.get(self.me_url).json()["email"] == email

    def test_verify_code_with_wrong_code_returns_401(self) -> None:
        """verify-code returns 401 with the OTP detail for an incorrect code."""
        email = "delivered+wrong@resend.dev"
        code = self._request_code(email)
        wrong = str((int(code) + 1) % 1_000_000).zfill(6)

        response = self._verify(email, wrong)
        assert response.status_code == 401
        # The real HttpError detail must reach the client (not a generic body).
        assert response.json() == {
            "detail": (
                "We're sorry, looks like that code is either invalid or expired. "
                "Try requesting a new one."
            )
        }

    def test_verify_code_with_expired_code_returns_401(self) -> None:
        """verify-code returns 401 for an expired code."""
        email = "delivered+expired@resend.dev"
        code = self._request_code(email)

        otp = EmailOTP.objects.get(email=email)
        otp.expires_at = timezone.now() - timedelta(minutes=1)
        otp.save()

        response = self._verify(email, code)
        assert response.status_code == 401

    def test_verify_code_with_consumed_code_returns_401(self) -> None:
        """verify-code returns 401 when the code was already used."""
        email = "delivered+reuse@resend.dev"
        code = self._request_code(email)

        assert self._verify(email, code).status_code == 200
        assert self._verify(email, code).status_code == 401

    def test_verify_code_with_no_prior_otp_returns_401(self) -> None:
        """verify-code returns 401 when no OTP was requested."""
        response = self._verify("delivered+no_otp@resend.dev", "123456")
        assert response.status_code == 401

    def test_verify_code_max_attempts_lockout(self) -> None:
        """After max failed attempts, even the correct code is rejected."""
        email = "delivered+lockout@resend.dev"
        code = self._request_code(email)
        wrong = str((int(code) + 1) % 1_000_000).zfill(6)

        for _ in range(5):
            self._verify(email, wrong)

        response = self._verify(email, code)
        assert response.status_code == 401


class MeEndpointTests(TestCase):
    """Tests for GET /api/accounts/me."""

    url = "/api/accounts/me"

    def setUp(self):
        cache.clear()

    def test_me_authenticated(self) -> None:
        """Authenticated request to /api/accounts/me returns the user profile."""
        user = User.objects.create_user("delivered+me-test@resend.dev")
        self.client.force_login(user)

        response = self.client.get(self.url)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "delivered+me-test@resend.dev"
        assert data["role"] == "member"
        assert data["username"] == user.username
        assert data["username"] != user.email
        assert data["first_name"] == ""
        assert data["last_name"] == ""
        assert data["receives_update_emails"] is True
        assert "date_joined" in data

    def test_me_unauthenticated_returns_401(self) -> None:
        """Unauthenticated request to /api/accounts/me returns 401."""
        response = self.client.get(self.url)
        assert response.status_code == 401

    def test_me_requires_active_session(self) -> None:
        """A request with no session cookie is treated as unauthenticated."""
        User.objects.create_user("delivered+other@resend.dev")
        response = self.client.get(self.url)
        assert response.status_code == 401


class LogoutTests(TestCase):
    """Tests for POST /api/accounts/logout."""

    url = "/api/accounts/logout"
    me_url = "/api/accounts/me"

    def setUp(self):
        cache.clear()

    def test_logout_authenticated_returns_204(self) -> None:
        """An authenticated user can log out and gets 204."""
        user = User.objects.create_user("delivered+logout@resend.dev")
        self.client.force_login(user)

        response = self.client.post(self.url)
        assert response.status_code == 204

    def test_logout_clears_session(self) -> None:
        """After logout the session is gone and /me returns 401."""
        user = User.objects.create_user("delivered+logout@resend.dev")
        self.client.force_login(user)
        assert self.client.get(self.me_url).status_code == 200

        self.client.post(self.url)
        assert self.client.get(self.me_url).status_code == 401

    def test_logout_unauthenticated_returns_401(self) -> None:
        """Logging out without a session returns 401."""
        response = self.client.post(self.url)
        assert response.status_code == 401


class UpdateMeTests(TestCase):
    """Tests for PATCH /api/accounts/me."""

    url = "/api/accounts/me"

    def setUp(self):
        cache.clear()

    def _patch(self, payload: dict) -> ...:
        return self.client.patch(self.url, payload, content_type="application/json")

    def test_update_names_and_opt_in(self) -> None:
        """Names and the update-email opt-in can be updated."""
        user = User.objects.create_user("delivered+me@resend.dev")
        self.client.force_login(user)

        resp = self._patch(
            {
                "first_name": "Ada",
                "last_name": "Lovelace",
                "receives_update_emails": False,
            }
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["first_name"] == "Ada"
        assert data["last_name"] == "Lovelace"
        assert data["receives_update_emails"] is False
        assert data["email"] == "delivered+me@resend.dev"
        assert data["username"] == user.username

    def test_update_partial(self) -> None:
        """Only the provided fields are changed."""
        user = User.objects.create_user("delivered+me@resend.dev", first_name="Old")
        self.client.force_login(user)

        resp = self._patch({"first_name": "New"})
        assert resp.status_code == 200
        user.refresh_from_db()
        assert user.first_name == "New"
        assert user.last_name == ""
        assert user.receives_update_emails is True

    def test_update_requires_auth(self) -> None:
        """Updating the profile without a session returns 401."""
        resp = self._patch({"first_name": "X"})
        assert resp.status_code == 401


class EmailChangeTests(TestCase):
    """Tests for POST /api/accounts/email/change."""

    url = "/api/accounts/email/change"
    request_url = "/api/accounts/otp/request"

    def setUp(self):
        cache.clear()

    def _request_code(self, email: str) -> str:
        with patch("apps.accounts.api.send_otp_email") as mock_send:
            resp = self.client.post(
                self.request_url,
                {"email": email},
                content_type="application/json",
            )
            assert resp.status_code == 200
            return mock_send.call_args[0][1]

    def _change(self, email: str, code: str):
        return self.client.post(
            self.url,
            {"email": email, "code": code},
            content_type="application/json",
        )

    def test_change_email_after_otp(self) -> None:
        """Verifying an OTP for a new email switches the user's email."""
        user = User.objects.create_user("delivered+old@resend.dev")
        self.client.force_login(user)

        new_email = "delivered+new@resend.dev"
        code = self._request_code(new_email)

        resp = self._change(new_email, code)
        assert resp.status_code == 200
        assert resp.json()["email"] == new_email

        user.refresh_from_db()
        assert user.email == new_email
        # The stable ID does not change when the email changes.
        assert user.username == resp.json()["username"]

    def test_change_email_rejects_used_email(self) -> None:
        """Switching to an email owned by another user is rejected."""
        user = User.objects.create_user("delivered+old@resend.dev")
        User.objects.create_user("delivered+taken@resend.dev")
        self.client.force_login(user)

        code = self._request_code("delivered+taken@resend.dev")
        resp = self._change("delivered+taken@resend.dev", code)
        assert resp.status_code == 400
        user.refresh_from_db()
        assert user.email == "delivered+old@resend.dev"

    def test_change_email_rejects_bad_code(self) -> None:
        """An invalid code cannot switch the email."""
        user = User.objects.create_user("delivered+old@resend.dev")
        self.client.force_login(user)

        resp = self._change("delivered+new@resend.dev", "000000")
        assert resp.status_code == 401
        user.refresh_from_db()
        assert user.email == "delivered+old@resend.dev"

    def test_change_email_requires_auth(self) -> None:
        """Changing email without a session returns 401."""
        resp = self._change("[EMAIL]", "123456")
        assert resp.status_code == 401


class RateLimitTests(TestCase):
    """Tests for django-ratelimit IP-based rate limiting on public endpoints."""

    request_url = "/api/accounts/otp/request"
    verify_url = "/api/accounts/otp/verify"

    def setUp(self):
        cache.clear()
        # Each test method needs the send_otp_email patch so the
        # request_otp view doesn't actually try to send email.
        self.send_patch = patch("apps.accounts.api.send_otp_email")
        self.send_patch.start()
        self.addCleanup(self.send_patch.stop)

    def _post(self, url: str, payload: dict):
        return self.client.post(url, payload, content_type="application/json")

    def test_request_otp_allows_five_requests(self) -> None:
        """The first 5 requests to request_otp from the same IP succeed."""
        for i in range(5):
            resp = self._post(self.request_url, {"email": f"[EMAIL]{i}@[EMAIL]"})
            assert resp.status_code == 200, (
                f"request {i + 1} returned {resp.status_code}"
            )

    def test_request_otp_blocks_sixth_request(self) -> None:
        """The 6th request within the window is blocked (429) by django-ratelimit."""
        for i in range(5):
            resp = self._post(self.request_url, {"email": f"[EMAIL]{i}@[EMAIL]"})
            assert resp.status_code == 200, (
                f"request {i + 1} returned {resp.status_code}"
            )

        resp = self._post(self.request_url, {"email": "[EMAIL]"})
        assert resp.status_code == 429
        # The detail reports the exact time left on the limiter window.
        detail = resp.json()["detail"]
        assert detail.startswith("Too many requests. Please try again")
        assert "shortly" in detail or "minute" in detail or "second" in detail

    def test_request_otp_rate_limit_resets_after_cache_clear(self) -> None:
        """Clearing the cache resets the IP rate-limit counter."""
        for i in range(5):
            resp = self._post(self.request_url, {"email": f"[EMAIL]{i}@[EMAIL]"})
            assert resp.status_code == 200, (
                f"request {i + 1} returned {resp.status_code}"
            )

        cache.clear()
        # After clearing, the first request should succeed again.
        resp = self._post(self.request_url, {"email": "[EMAIL]"})
        assert resp.status_code == 200

    def test_request_otp_different_emails_share_ip_counter(self) -> None:
        """The rate limit is per IP, not per email — different emails aren't isolated."""  # noqa: E501
        for i in range(4):
            resp = self._post(self.request_url, {"email": f"[EMAIL]{i}@[EMAIL]"})
            assert resp.status_code == 200, (
                f"request {i + 1} returned {resp.status_code}"
            )

        # The 5th request (any email) still succeeds.
        resp = self._post(self.request_url, {"email": "[EMAIL]"})
        assert resp.status_code == 200

        # The 6th request is blocked.
        resp = self._post(self.request_url, {"email": "[EMAIL]"})
        assert resp.status_code == 429

    def test_verify_otp_allows_ten_requests(self) -> None:
        """The first 10 requests to verify_otp from the same IP succeed."""
        for _ in range(10):
            resp = self._post(
                self.verify_url,
                {"email": "[EMAIL]", "code": "000000"},
            )
            # The view returns 401 (bad code) but the rate-limiter lets it through.
            assert resp.status_code == 401

    def test_verify_otp_blocks_eleventh_request(self) -> None:
        """The 11th request within the window is blocked (429) by django-ratelimit."""
        for _ in range(10):
            resp = self._post(
                self.verify_url,
                {"email": "[EMAIL]", "code": "000000"},
            )
            assert resp.status_code == 401

        resp = self._post(
            self.verify_url,
            {"email": "[EMAIL]", "code": "000000"},
        )
        assert resp.status_code == 429
        # The detail reports the exact time left on the limiter window.
        detail = resp.json()["detail"]
        assert detail.startswith("Too many requests. Please try again")
        assert "shortly" in detail or "minute" in detail or "second" in detail

    def test_verify_otp_rate_limit_resets_after_cache_clear(self) -> None:
        """Clearing the cache resets the IP rate-limit counter for verify_otp."""
        for _ in range(10):
            self._post(self.verify_url, {"email": "[EMAIL]", "code": "000000"})

        cache.clear()
        resp = self._post(self.verify_url, {"email": "[EMAIL]", "code": "000000"})
        assert resp.status_code == 401  # view rejects the code, but rate-limit is OK
