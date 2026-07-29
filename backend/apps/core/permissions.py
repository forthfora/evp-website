from __future__ import annotations

from typing import TYPE_CHECKING, Any

from jwt_ninja.auth_classes import AuthDetails, JWTAuth
from jwt_ninja.errors import APIError

if TYPE_CHECKING:
    from django.http import HttpRequest

    from apps.accounts.models import User


class RoleAuth(JWTAuth):
    """Django Ninja auth class that requires the user to hold one of the
    given roles in addition to valid JWT authentication.

    Usage::

        @router.get("/admin", auth=RoleAuth("committee"))
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

        @router.get("/entries", auth=require_role("scout", "committee"))
        def list_entries(request):
            ...
    """
    return RoleAuth(*roles)


def is_owner_or_committee(user: User, obj: Any) -> bool:
    """Return ``True`` if *user* is a committee member or owns *obj*
    (i.e. ``obj.created_by == user``).  Intended for use in directory-style
    resources where scouts may only edit their own entries."""
    return user.is_committee or getattr(obj, "created_by", None) == user
