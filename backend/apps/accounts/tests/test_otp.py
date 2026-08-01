from __future__ import annotations

import string
from datetime import timedelta

import hypothesis.strategies as st
import pytest
from django.utils import timezone
from freezegun import freeze_time
from hypothesis import given
from hypothesis.extra.django import TestCase as HypothesisTestCase

from apps.accounts.models import EmailOTP

# Strategy for generating valid 6-digit numeric codes (as strings)
valid_code = st.text(alphabet=string.digits, min_size=6, max_size=6)


class EmailOTPModelTests(HypothesisTestCase):
    @given(email=st.emails(), code=valid_code)
    def test_is_valid_true_when_unconsumed_and_not_expired(
        self, email: str, code: str
    ) -> None:
        """A fresh, unconsumed, non-expired OTP is valid."""
        otp = EmailOTP.objects.create(email=email, code=code)
        assert otp.is_valid

    @given(email=st.emails(), code=valid_code)
    def test_is_valid_false_after_consume(self, email: str, code: str) -> None:
        """After a successful try_consume(), is_valid is False."""
        otp = EmailOTP.objects.create(email=email, code=code)
        assert otp.try_consume(code) is True
        assert not otp.is_valid

    @given(email=st.emails(), code=valid_code)
    def test_is_valid_false_after_expiry(self, email: str, code: str) -> None:
        """An expired OTP is not valid, even if unconsumed."""
        with freeze_time(timezone.now() - timedelta(minutes=30)):
            otp = EmailOTP.objects.create(email=email, code=code)

        # now we're back to "present" — the OTP was created 30 min ago
        assert not otp.is_valid

    @given(email=st.emails(), code=valid_code)
    def test_try_consume_with_wrong_code_returns_false(
        self, email: str, code: str
    ) -> None:
        """try_consume() with a wrong code returns False and increments attempts."""
        otp = EmailOTP.objects.create(email=email, code=code)
        wrong_code = str((int(code) + 1) % 1_000_000).zfill(6)

        result = otp.try_consume(wrong_code)
        assert not result
        assert otp.attempts == 1

    @given(email=st.emails(), code=valid_code)
    def test_max_attempts_lockout(self, email: str, code: str) -> None:
        """After max_attempts wrong tries, try_consume() always returns False
        even with the correct code."""
        otp = EmailOTP.objects.create(email=email, code=code)

        # Exhaust attempts with wrong codes
        wrong_code = str((int(code) + 1) % 1_000_000).zfill(6)
        for _ in range(otp.max_attempts):
            otp.try_consume(wrong_code)

        assert otp.attempts >= otp.max_attempts

        # Now even the correct code fails
        result = otp.try_consume(code)
        assert not result

    @given(email=st.emails(), code=valid_code)
    def test_try_consume_success_marks_consumed(self, email: str, code: str) -> None:
        """A successful try_consume() marks the OTP consumed and returns True."""
        otp = EmailOTP.objects.create(email=email, code=code)

        result = otp.try_consume(code)
        assert result is True
        assert otp.consumed is True

    def test_default_ttl_is_10_minutes(self) -> None:
        """An OTP defaults to a 10-minute expiry from creation."""
        with freeze_time(timezone.now()):
            otp = EmailOTP.objects.create(email="test@example.com")
            expected = timezone.now() + timedelta(minutes=10)
            # Allow 1s tolerance for execution time
            assert otp.expires_at.timestamp() == pytest.approx(
                expected.timestamp(), abs=1
            )

    def test_throttle_starts_low_and_escalates(self) -> None:
        """The wait starts at the first tier and escalates per request."""
        assert EmailOTP.throttle_wait_seconds("throttle@example.com") == 5
        EmailOTP.objects.create(email="throttle@example.com")
        assert EmailOTP.throttle_wait_seconds("throttle@example.com") == 15
        EmailOTP.objects.create(email="throttle@example.com")
        assert EmailOTP.throttle_wait_seconds("throttle@example.com") == 30

    def test_throttle_escalates_after_three_requests(self) -> None:
        """The 4th request waits 60s, the 5th 5 minutes, then it escalates."""
        for _ in range(3):
            EmailOTP.objects.create(email="throttle@example.com")
        assert EmailOTP.throttle_wait_seconds("throttle@example.com") == 60
        EmailOTP.objects.create(email="throttle@example.com")
        assert EmailOTP.throttle_wait_seconds("throttle@example.com") == 300
        EmailOTP.objects.create(email="throttle@example.com")
        assert EmailOTP.throttle_wait_seconds("throttle@example.com") == 600
        EmailOTP.objects.create(email="throttle@example.com")
        assert EmailOTP.throttle_wait_seconds("throttle@example.com") == 1200

    def test_throttle_is_capped(self) -> None:
        """The wait never exceeds the configured maximum."""
        for _ in range(12):
            EmailOTP.objects.create(email="throttle@example.com")
        assert EmailOTP.throttle_wait_seconds("throttle@example.com") == (
            EmailOTP.THROTTLE_MAX_WAIT
        )

    def test_remaining_cooldown_zero_without_requests(self) -> None:
        """No prior requests means no cooldown."""
        assert EmailOTP.remaining_cooldown("throttle@example.com") == 0

    def test_remaining_cooldown_positive_after_request(self) -> None:
        """A fresh request is throttled for the tier's wait."""
        EmailOTP.objects.create(email="throttle@example.com")
        assert EmailOTP.remaining_cooldown("throttle@example.com") > 0

    def test_remaining_cooldown_clears_after_wait(self) -> None:
        """Once the tier's wait elapses, the next request is allowed."""
        with freeze_time(timezone.now()):
            EmailOTP.objects.create(email="throttle@example.com")
        with freeze_time(timezone.now() + timedelta(seconds=16)):
            assert EmailOTP.remaining_cooldown("throttle@example.com") == 0

    def test_throttle_window_decays_old_requests(self) -> None:
        """Requests older than the window stop counting (reset after some time)."""
        with freeze_time(
            timezone.now() - EmailOTP.THROTTLE_WINDOW - timedelta(minutes=1)
        ):
            for _ in range(6):
                EmailOTP.objects.create(email="throttle@example.com")
        assert EmailOTP.throttle_wait_seconds("throttle@example.com") == 5

    def test_reset_throttle_clears_requests(self) -> None:
        """reset_throttle removes the request history for an email."""
        EmailOTP.objects.create(email="throttle@example.com")
        EmailOTP.reset_throttle("throttle@example.com")
        assert EmailOTP.objects.filter(email="throttle@example.com").count() == 0
        assert EmailOTP.remaining_cooldown("throttle@example.com") == 0

    def test_default_code_is_six_digits(self) -> None:
        """A freshly created OTP gets a 6-digit numeric code."""
        otp = EmailOTP.objects.create(email="test@example.com")
        assert len(otp.code) == 6
        assert otp.code.isdigit()

    def test_codes_are_random_per_instance(self) -> None:
        """Each OTP instance gets a distinct code (the default is per-instance)."""
        codes = {
            EmailOTP.objects.create(email=f"user{i}@example.com").code
            for i in range(20)
        }
        assert len(codes) == 20
