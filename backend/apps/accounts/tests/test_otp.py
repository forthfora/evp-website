from __future__ import annotations

import string
from datetime import timedelta

import hypothesis.strategies as st
from django.utils import timezone
from freezegun import freeze_time
from hypothesis import given, settings
from hypothesis.extra.django import TestCase as HypothesisTestCase

from apps.accounts.models import EmailOTP

# Strategy for generating valid 6-digit numeric codes (as strings)
valid_code = st.text(
    alphabet=string.digits, min_size=6, max_size=6
)

class EmailOTPModelTests(HypothesisTestCase):
    @given(email=st.emails(), code=valid_code)
    def test_is_valid_true_when_unconsumed_and_not_expired(
        self, email: str, code: str
    ) -> None:
        """A fresh, unconsumed, non-expired OTP is valid."""
        otp = EmailOTP.objects.create(email=email)
        otp.set_code(code)
        self.assertTrue(otp.is_valid)

    @given(email=st.emails(), code=valid_code)
    def test_is_valid_false_after_consume(self, email: str, code: str) -> None:
        """After consume() succeeds, is_valid is False."""
        otp = EmailOTP.objects.create(email=email)
        otp.set_code(code)
        otp.consume(code)
        self.assertFalse(otp.is_valid)

    @given(email=st.emails(), code=valid_code)
    def test_is_valid_false_after_expiry(self, email: str, code: str) -> None:
        """An expired OTP is not valid, even if unconsumed."""
        with freeze_time(timezone.now() - timedelta(minutes=30)):
            otp = EmailOTP.objects.create(email=email)
            otp.set_code(code)

        # now we're back to "present" — the OTP was created 30 min ago
        self.assertFalse(otp.is_valid)

    @given(email=st.emails(), code=valid_code)
    def test_consume_with_wrong_code_returns_false(
        self, email: str, code: str
    ) -> None:
        """consume() with a wrong code returns False and increments attempts."""
        otp = EmailOTP.objects.create(email=email)
        otp.set_code(code)
        wrong_code = str((int(code) + 1) % 1_000_000).zfill(6)

        result = otp.consume(wrong_code)
        self.assertFalse(result)
        self.assertEqual(otp.attempts, 1)

    @given(email=st.emails(), code=valid_code)
    def test_max_attempts_lockout(self, email: str, code: str) -> None:
        """After max_attempts wrong tries, consume() always returns False
        even with the correct code."""
        otp = EmailOTP.objects.create(email=email)
        otp.set_code(code)

        # Exhaust attempts with wrong codes
        wrong_code = str((int(code) + 1) % 1_000_000).zfill(6)
        for _ in range(otp.max_attempts):
            otp.consume(wrong_code)

        self.assertGreaterEqual(otp.attempts, otp.max_attempts)

        # Now even the correct code fails
        result = otp.consume(code)
        self.assertFalse(result)

    @given(email=st.emails(), code=valid_code)
    def test_consume_success_marks_consumed_at(
        self, email: str, code: str
    ) -> None:
        """A successful consume() sets consumed_at and returns True."""
        otp = EmailOTP.objects.create(email=email)
        otp.set_code(code)

        result = otp.consume(code)
        self.assertTrue(result)
        self.assertIsNotNone(otp.consumed_at)

    def test_default_ttl_is_10_minutes(self) -> None:
        """An OTP defaults to a 10-minute expiry from creation."""
        with freeze_time(timezone.now()):
            otp = EmailOTP.objects.create(email="test@example.com")
            expected = timezone.now() + timedelta(minutes=10)
            # Allow 1s tolerance for execution time
            self.assertAlmostEqual(
                otp.expires_at.timestamp(),
                expected.timestamp(),
                delta=1,
            )

    def test_generate_code_returns_six_digits(self) -> None:
        """generate_code() returns a 6-digit numeric string."""
        code = EmailOTP.generate_code()
        self.assertEqual(len(code), 6)
        self.assertTrue(code.isdigit())
