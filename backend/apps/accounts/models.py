import math
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
    code = models.CharField(
        default=generate_otp_code,
        max_length=6,
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

    THROTTLE_WINDOW = timedelta(minutes=10)
    THROTTLE_TIERS = (5, 15, 30, 60, 300)
    THROTTLE_MAX_WAIT = 3600

    @classmethod
    def throttle_wait_seconds(cls, email: str) -> int:
        """Seconds the next request for `email` must wait, based on recent ones."""
        since = timezone.now() - cls.THROTTLE_WINDOW
        count = cls.objects.filter(email=email, created_at__gte=since).count()
        if count < len(cls.THROTTLE_TIERS):
            return cls.THROTTLE_TIERS[count]
        wait = 600
        for _ in range(count - len(cls.THROTTLE_TIERS)):
            wait *= 2
        return min(wait, cls.THROTTLE_MAX_WAIT)

    @classmethod
    def remaining_cooldown(cls, email: str) -> int:
        """Seconds until the next request for `email` is allowed (0 = allowed)."""
        last = cls.objects.filter(email=email).order_by("-created_at").first()
        if last is None:
            return 0
        wait = cls.throttle_wait_seconds(email)
        elapsed = (timezone.now() - last.created_at).total_seconds()
        if elapsed >= wait:
            return 0
        return math.ceil(wait - elapsed)

    @classmethod
    def reset_throttle(cls, email: str) -> None:
        """Clear the request throttle for `email` (after login/logout)."""
        cls.objects.filter(email=email).delete()

    def try_consume(self, code: str) -> bool:
        self.attempts += 1
        self.save(update_fields=["attempts"])

        if code != self.code:
            return False

        if not self.is_valid:
            return False

        self.consumed = True
        self.save(update_fields=["consumed"])
        return True
