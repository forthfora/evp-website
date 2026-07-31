from __future__ import annotations

from typing import TYPE_CHECKING

from ninja.errors import HttpError

if TYPE_CHECKING:
    from django.db import models

    from apps.accounts.models import User


class RoleAuth:
    def __init__(self, *roles: str):
        self.roles = roles

    def __call__(self, request):
        if not request.user.is_authenticated:
            return None  # 401 Unauthorized

        if request.user.role not in self.roles:
            raise HttpError(403, "Forbidden")

        return request.user


def can_manage_entry(user: User, obj: models.Model) -> bool:
    if user.is_admin:
        return True

    if not user.is_committee and not user.is_scout:
        return False

    return getattr(obj, "created_by", None) == user
