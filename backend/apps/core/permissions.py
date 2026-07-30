from __future__ import annotations

from typing import TYPE_CHECKING

from jwt_ninja.auth_classes import AuthDetails, JWTAuth
from jwt_ninja.errors import APIError

if TYPE_CHECKING:
    from django.db import models
    from django.http import HttpRequest

    from apps.accounts.models import User


class RoleAuth(JWTAuth):
    """Django Ninja auth class that requires the user to hold one of the
    given roles in addition to valid JWT authentication.

    Usage::

        @router.get("/admin", auth=RoleAuth("admin"))
        def admin_endpoint(request):
            ...

    Or via the :func:`require_role` shorthand.
    """

    def __init__(self, *roles: str) -> None:
        self.required_roles = roles

    def authenticate(self, request: HttpRequest, token: str) -> AuthDetails | None:
        details = super().authenticate(request, token)

        if details is None:
            return None

        if not self.check_roles(details):
            raise APIError("forbidden", 403)

        return details

    def check_roles(self, details: AuthDetails) -> bool:
        """Return ``True`` iff the authenticated user's role is one of the
        permitted roles.  Separated from :meth:`authenticate` so tests can
        check it without a real JWT token."""
        return details.user.role in self.required_roles


def require_role(*roles: str) -> RoleAuth:
    """Shorthand to create a :class:`RoleAuth` instance for use as a
    Django Ninja ``auth`` parameter::

        @router.get("/startupdb", auth=require_role("scout", "committee"))
        def list_entries(request):
            ...
    """
    return RoleAuth(*roles)


def can_manage_entry(user: User, obj: models.Model) -> bool:
    if user.is_admin:
        return True

    if not user.is_committee and not user.is_scout:
        return False

    return getattr(obj, "created_by", None) == user


def can_view_startups(user: User) -> bool:
    return user.is_admin or user.is_committee or user.is_scout


def can_send_notifications(user: User) -> bool:
    return user.is_admin
