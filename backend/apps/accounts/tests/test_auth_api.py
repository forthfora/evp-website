from __future__ import annotations

from datetime import timedelta
from unittest.mock import patch

import hypothesis.strategies as st
from django.test import TestCase
from django.utils import timezone
from freezegun import freeze_time
from hypothesis import assume, given, settings
from hypothesis.extra.django import TestCase as HypothesisTestCase

from apps.accounts.models import EmailOTP, User


class AuthAPITests(TestCase):
    """Integration tests for the OTP auth endpoints."""

    def setUp(self) -> None:
        self.request_code_url = "/api/auth/request-code"
        self.verify_code_url = "/api/auth/verify-code"

    @patch("apps.accounts.api.send_otp_email")
    def test_request_code_always_returns_202(self, mock_send) -> None:
        """request-code returns 202 even when the email is unknown
        (prevents user enumeration)."""
        response = self.client.post(
            self.request_code_url,
            {"email": "nonexistent@example.com"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 202)

    @patch("apps.accounts.api.send_otp_email")
    def test_request_code_creates_otp_record(self, mock_send) -> None:
        """request-code creates an EmailOTP record."""
        self.assertEqual(EmailOTP.objects.count(), 0)
        self.client.post(
            self.request_code_url,
            {"email": "test@example.com"},
            content_type="application/json",
        )
        self.assertEqual(EmailOTP.objects.count(), 1)

    @patch("apps.accounts.api.send_otp_email")
    def test_request_code_calls_send_otp_email(self, mock_send) -> None:
        """request-code calls send_otp_email with the email and a code."""
        self.client.post(
            self.request_code_url,
            {"email": "test@example.com"},
            content_type="application/json",
        )
        mock_send.assert_called_once()
        args = mock_send.call_args[0]
        self.assertEqual(args[0], "test@example.com")
        self.assertEqual(len(args[1]), 6)  # 6-digit code

    @patch("apps.accounts.api.send_otp_email")
    def test_request_code_returns_202_for_existing_user(self, mock_send) -> None:
        """request-code returns 202 for existing users too (no enumeration)."""
        User.objects.create_user("existing@example.com")
        response = self.client.post(
            self.request_code_url,
            {"email": "existing@example.com"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 202)

    @patch("apps.accounts.api.send_otp_email")
    def test_request_code_ratelimit_exceeded(self, mock_send) -> None:
        """Rapid repeated request-code for the same email returns 429."""
        email = "ratelimit@example.com"

        # First request succeeds
        resp1 = self.client.post(
            self.request_code_url,
            {"email": email},
            content_type="application/json",
        )
        self.assertEqual(resp1.status_code, 202)

        # Second request immediately after is rate-limited
        resp2 = self.client.post(
            self.request_code_url,
            {"email": email},
            content_type="application/json",
        )
        self.assertEqual(resp2.status_code, 429)

    @patch("apps.accounts.api.send_otp_email")
    def test_request_code_ratelimit_expires(self, mock_send) -> None:
        """request-code works again for the same email after cooldown."""
        email = "cooldown@example.com"

        # First request just before cooldown expiry
        with freeze_time(timezone.now() - timedelta(seconds=61)):
            resp1 = self.client.post(
                self.request_code_url,
                {"email": email},
                content_type="application/json",
            )
            self.assertEqual(resp1.status_code, 202)

        # 61 seconds later — cooldown has passed, request should succeed
        resp2 = self.client.post(
            self.request_code_url,
            {"email": email},
            content_type="application/json",
        )
        self.assertEqual(resp2.status_code, 202)

    @patch("apps.accounts.api.send_otp_email")
    def test_request_code_ratelimit_per_email(self, mock_send) -> None:
        """Rate limiting is per-email; a second email is not blocked."""
        # First request for email A
        self.client.post(
            self.request_code_url,
            {"email": "a@example.com"},
            content_type="application/json",
        )

        # Request for email B succeeds (different cooldown bucket)
        resp_b = self.client.post(
            self.request_code_url,
            {"email": "b@example.com"},
            content_type="application/json",
        )
        self.assertEqual(resp_b.status_code, 202)

    @patch("apps.accounts.api.send_otp_email")
    def test_verify_code_max_attempts_lockout(self, mock_send) -> None:
        """After max failed verify attempts, even a correct code is rejected."""
        email = "lockout@example.com"
        self.client.post(
            self.request_code_url,
            {"email": email},
            content_type="application/json",
        )
        code = mock_send.call_args[0][1]

        # Exhaust attempts with wrong codes
        wrong = str((int(code) + 1) % 1_000_000).zfill(6)
        for _ in range(5):
            self.client.post(
                self.verify_code_url,
                {"email": email, "code": wrong},
                content_type="application/json",
            )

        # Now even the correct code fails
        response = self.client.post(
            self.verify_code_url,
            {"email": email, "code": code},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    @patch("apps.accounts.api.send_otp_email")
    def test_verify_code_creates_new_user_and_returns_tokens(self, mock_send) -> None:
        """verify-code with correct code creates user and returns JWT tokens."""
        self.client.post(
            self.request_code_url,
            {"email": "newuser@example.com"},
            content_type="application/json",
        )

        # Get the raw code from the mock call
        raw_code = mock_send.call_args[0][1]

        response = self.client.post(
            self.verify_code_url,
            {"email": "newuser@example.com", "code": raw_code},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access", data)

        # Verify user was created
        user = User.objects.get(email="newuser@example.com")
        self.assertEqual(user.role, "member")
        self.assertFalse(user.has_usable_password())

    def test_verify_code_with_wrong_code_returns_400(self) -> None:
        """verify-code returns 400 for an incorrect code."""
        otp = EmailOTP.objects.create(email="test@example.com")
        otp.set_code("123456")
        otp.save()

        response = self.client.post(
            self.verify_code_url,
            {"email": "test@example.com", "code": "654321"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_verify_code_with_expired_code_returns_400(self) -> None:
        """verify-code returns 400 for an expired code."""
        from datetime import timedelta

        from django.utils import timezone

        otp = EmailOTP.objects.create(email="test@example.com")
        otp.set_code("123456")
        # Override expires_at to the past AFTER set_code (which sets it to +10 min)
        otp.expires_at = timezone.now() - timedelta(minutes=1)
        otp.save()

        response = self.client.post(
            self.verify_code_url,
            {"email": "test@example.com", "code": "123456"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_verify_code_with_consumed_code_returns_400(self) -> None:
        """verify-code returns 400 for an already-consumed code."""
        otp = EmailOTP.objects.create(email="test@example.com")
        otp.set_code("123456")
        otp.save()

        # Consume it first
        result = otp.consume("123456")
        self.assertTrue(result)

        response = self.client.post(
            self.verify_code_url,
            {"email": "test@example.com", "code": "123456"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_verify_code_with_no_prior_otp_returns_400(self) -> None:
        """verify-code returns 400 when no OTP was requested."""
        response = self.client.post(
            self.verify_code_url,
            {"email": "no_otp@example.com", "code": "123456"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    @patch("apps.accounts.api.send_otp_email")
    def test_verify_code_sets_refresh_cookie(self, mock_send) -> None:
        """verify-code sets the refresh token as an HttpOnly cookie."""
        self.client.post(
            self.request_code_url,
            {"email": "cookie@example.com"},
            content_type="application/json",
        )
        raw_code = mock_send.call_args[0][1]

        response = self.client.post(
            self.verify_code_url,
            {"email": "cookie@example.com", "code": raw_code},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)

        # Check the refresh cookie was set
        cookies = response.cookies
        self.assertIn("refresh_token", cookies)
        refresh_cookie = cookies["refresh_token"]
        self.assertTrue(refresh_cookie["httponly"])


class AuthAPIPropertyTests(HypothesisTestCase):
    """Hypothesis property-based tests for the auth API."""

    def setUp(self) -> None:
        self.verify_code_url = "/api/auth/verify-code"

    @settings(deadline=None, max_examples=20)
    @given(
        email=st.emails(),
        correct_code=st.from_regex(r"\d{6}", fullmatch=True),
        wrong_code=st.from_regex(r"\d{6}", fullmatch=True),
    )
    def test_verify_code_never_succeeds_with_wrong_code(
        self, email: str, correct_code: str, wrong_code: str
    ) -> None:
        """For any valid email and any non-matching 6-digit code, verify-code
        never returns success."""
        assume(correct_code != wrong_code)

        otp = EmailOTP.objects.create(email=email)
        otp.set_code(correct_code)
        otp.save()

        response = self.client.post(
            self.verify_code_url,
            {"email": email, "code": wrong_code},
            content_type="application/json",
        )
        self.assertNotEqual(response.status_code, 200)  # redundant
        self.assertIn(response.status_code, (400, 401))
