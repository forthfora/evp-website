from __future__ import annotations  # make type hints lazy

import secrets
from datetime import timedelta

from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone


def get_otp_expiry():
    """Return the default expiry time for OTP codes (10 minutes from now)."""
    return timezone.now() + timedelta(minutes=10)


class UserManager[T](BaseUserManager):
    def create_user(
        self,
        username: str,  # first positional — maps to USERNAME_FIELD (email)
        email: str | None = None,
        password: str | None = None,
        **other_fields,
    ) -> User:
        # When USERNAME_FIELD = "email", Django passes email as the first
        # positional arg.  We also accept an explicit `email` kwarg — if
        # given we prefer it, otherwise fall back to the positional value.
        email_value = email or username
        username_value = other_fields.pop("username", email_value)

        user = User(email=email_value, username=username_value, **other_fields)

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()  # passwordless account (auth or invite-only)

        user.save()
        return user

    def create_superuser(
        self,
        username: str,
        email: str | None = None,
        password: str | None = None,
        **other_fields,
    ) -> User:
        # username is the value for USERNAME_FIELD ("email"); superuser
        # requires that it equals the explicit email (if given).
        email_value = email or username

        if username != email_value:
            raise ValueError("Superuser must be assigned with username=email")

        other_fields.setdefault("is_staff", True)
        other_fields.setdefault("is_superuser", True)
        other_fields.setdefault("is_active", True)

        if other_fields.get("is_staff") is not True:
            raise ValueError("Superuser must be assigned to is_staff=True.")

        if other_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must be assigned to is_superuser=True.")

        return self.create_user(
            username, email=email, password=password, **other_fields
        )


class Role(models.TextChoices):
    MEMBER = "member", "Member"
    SCOUT = "scout", "Scout"
    COMMITTEE = "committee", "Committee"


class User(AbstractUser):
    # Declare the implicit primary key so Pylance can resolve `user.id`
    id: int

    # remove default fields
    first_name = None
    last_name = None

    email = models.EmailField("Email Address", unique=True)
    username = models.CharField(max_length=254, unique=True)
    image = models.URLField(default="", blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.MEMBER)

    EMAIL_FIELD = "email"
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []  # noqa: RUF012

    objects = UserManager()  # type: ignore

    @property
    def is_scout(self) -> bool:
        return self.role == Role.SCOUT

    @property
    def is_committee(self) -> bool:
        return self.role == Role.COMMITTEE

    @property
    def is_privileged(self) -> bool:
        """Used for permission gates. Free user is the default."""
        return self.role in (Role.SCOUT, Role.COMMITTEE)


class EmailOTP(models.Model):
    """A short-lived one-time passcode for passwordless authentication.

    Stores a hashed code tied to an email address (not a User foreign key) so that
    codes can be requested before the user account exists.
    """

    email = models.EmailField()

    # OTP declaraton
    code_hash = models.CharField(max_length=128, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=get_otp_expiry)
    consumed_at = models.DateTimeField(null=True, blank=True)

    attempts = models.IntegerField(default=0)

    # tells Django how to render and handle this model
    class Meta:
        verbose_name = "Email OTP"
        verbose_name_plural = "Email OTPs"

    def __str__(self) -> str:
        return f"OTP for {self.email} (valid: {self.is_valid})"

    @property
    def is_valid(self) -> bool:
        """True when not consumed, not expired, and not locked out."""
        if self.consumed_at is not None:
            return False
        if timezone.now() >= self.expires_at:
            return False
        return not self.attempts >= self.max_attempts

    @property
    def max_attempts(self) -> int:
        """Maximum number of failed verification attempts before lockout."""
        return 5

    @property
    def cooldown_seconds(self) -> int:
        """Minimum seconds between request-code calls for the same email."""
        return 60

    @staticmethod
    def generate_code() -> str:
        """Generate a random 6-digit numeric code as a string."""
        # secrets over random since it generates cryptographically stronger numbers
        return f"{secrets.randbelow(1_000_000):06d}"

    def set_code(self, code: str) -> None:
        """Hash and store the given code."""
        self.code_hash = make_password(code)
        self.expires_at = timezone.now() + timedelta(minutes=10)

    def consume(self, code: str) -> bool:
        """Attempt to verify and consume this OTP.

        Increments the attempt counter regardless of success. Returns True
        if the code is correct, the OTP is still valid, and it hasn't been
        consumed yet.
        """
        self.attempts += 1

        if not self.is_valid:
            self.save(update_fields=["attempts"])
            return False

        if not check_password(code, self.code_hash):
            self.save(update_fields=["attempts"])
            return False

        self.consumed_at = timezone.now()
        self.save(update_fields=["attempts", "consumed_at"])
        return True
