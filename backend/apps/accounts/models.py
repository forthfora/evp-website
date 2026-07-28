from __future__ import annotations # make type hints lazy
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class UserManager[T](BaseUserManager):
    def create_user(self, email: str, password: str | None = None, **other_fields) -> User:
        user = User(email=email, **other_fields)

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password() # passwordless account (auth or invite-only)

        user.save()
        return user

    def create_superuser(self, email: str, password: str | None = None, **other_fields) -> User:
        other_fields.setdefault("is_staff", True)
        other_fields.setdefault("is_superuser", True)
        other_fields.setdefault("is_active", True)

        if other_fields.get("is_staff") is not True:
            raise ValueError("Superuser must be assigned to is_staff=True.")

        if other_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must be assigned to is_superuser=True.")
        
        return self.create_user(email, password, **other_fields)


class User(AbstractUser):
    # remove default fields
    first_name = None
    last_name = None

    email = models.EmailField("Email Address", unique=True)
    username = models.CharField(max_length=60, unique=True)
    image = models.URLField(null=True, blank=True)

    EMAIL_FIELD = "email"
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    objects = UserManager() # type: ignore
    