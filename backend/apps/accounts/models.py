import hashlib
import secrets
import uuid
from datetime import timedelta

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone


def get_otp_expiry():
    """Return the default expiry time for OTP codes (10 minutes from now)."""
    return timezone.now() + timedelta(minutes=10)


def generate_otp_code() -> str:
    """Generate a random 6-digit numeric OTP code."""
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_otp_code(code: str) -> str:
    """Hash an OTP code for at-rest storage (SHA-256 hex digest).

    Codes are persisted only in hashed form so that a database leak does
    not expose live (unconsumed, unexpired) codes.
    """
    return hashlib.sha256(code.encode()).hexdigest()


def generate_hashed_otp_code() -> str:
    """Default for EmailOTP.code: a hashed random code (never plaintext)."""
    return hash_otp_code(generate_otp_code())


def generate_username() -> str:
    return uuid.uuid4().hex


class UserManager(BaseUserManager):
    def create_user(
        self,
        email: str,
        first_name: str = "",
        last_name: str = "",
        **other_fields,
    ) -> "User":
        if not email:
            raise ValueError("Accounts must have an email.")

        fields: dict = {
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            **other_fields,
        }

        user = self.model(**fields)
        user.set_unusable_password()
        user.save()
        return user

    def create_superuser(
        self,
        email: str,
        first_name: str = "",
        last_name: str = "",
        **other_fields,
    ) -> "User":
        other_fields.setdefault("is_staff", True)
        other_fields.setdefault("is_superuser", True)
        other_fields.setdefault("is_active", True)
        other_fields.setdefault("role", "admin")

        if other_fields.get("is_staff") is not True:
            raise ValueError("Superuser must be assigned to is_staff=True.")

        if other_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must be assigned to is_superuser=True.")

        return self.create_user(email, first_name, last_name, **other_fields)


class Role(models.TextChoices):
    MEMBER = "member", "Member"
    SCOUT = "scout", "Scout"
    COMMITTEE = "committee", "Committee"
    ADMIN = "admin", "Admin"


class User(AbstractUser):
    username = models.CharField(
        "Username",
        max_length=150,
        unique=True,
        default=generate_username,
        editable=False,
    )
    email = models.EmailField(unique=True)
    first_name = models.CharField("First Name", max_length=150)
    last_name = models.CharField("Last Name", max_length=150)

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.MEMBER)

    receives_update_emails = models.BooleanField(
        default=True,
        help_text="Whether this user receives non-essential update emails.",
    )

    objects = UserManager()  # type: ignore

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]  # noqa: RUF012

    @property
    def is_scout(self) -> bool:
        return self.role == Role.SCOUT

    @property
    def is_committee(self) -> bool:
        return self.role == Role.COMMITTEE

    @property
    def is_admin(self) -> bool:
        return self.role == Role.ADMIN


class EmailOTP(models.Model):
    email = models.EmailField()
    # SHA-256 hex digest of the 6-digit code — never the plaintext code.
    code = models.CharField(
        default=generate_hashed_otp_code,
        max_length=64,
        editable=False,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=get_otp_expiry)
    consumed = models.BooleanField(default=False)

    attempts = models.IntegerField(default=0)

    class Meta:
        verbose_name = "Email OTP"
        verbose_name_plural = "Email OTPs"

    def __str__(self) -> str:
        return f"OTP for {self.email} (valid: {self.is_valid})"

    @property
    def is_valid(self) -> bool:
        if self.consumed:
            return False

        if timezone.now() >= self.expires_at:
            return False

        return not self.attempts >= self.max_attempts

    @property
    def max_attempts(self) -> int:
        """Maximum number of failed verification attempts before lockout."""
        return 5

    @classmethod
    def cleanup(cls) -> int:
        """Delete consumed and expired OTP records; returns rows deleted."""
        return cls.objects.filter(
            models.Q(consumed=True) | models.Q(expires_at__lt=timezone.now())
        ).delete()[0]

    @classmethod
    def issue(cls, email: str) -> "tuple[EmailOTP, str]":
        """Create a new OTP for `email`; returns (record, plaintext code).

        The plaintext code is returned exactly once, for delivery (email);
        only its SHA-256 hash is persisted.
        """
        code = generate_otp_code()
        otp = cls.objects.create(email=email, code=hash_otp_code(code))
        return otp, code

    def try_consume(self, code: str) -> bool:
        self.attempts += 1
        self.save(update_fields=["attempts"])

        # Constant-time comparison of the hashed candidate against the
        # stored hash (which is itself the SHA-256 digest of the real code).
        if not secrets.compare_digest(hash_otp_code(code), self.code):
            return False

        if not self.is_valid:
            return False

        self.consumed = True
        self.save(update_fields=["consumed"])
        return True
