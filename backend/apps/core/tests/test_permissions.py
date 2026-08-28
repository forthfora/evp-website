from unittest.mock import Mock

import hypothesis.strategies as st
import pytest
from django.test import TestCase
from hypothesis import given, settings
from hypothesis.extra.django import TestCase as HypothesisTestCase
from ninja.errors import HttpError

from apps.accounts.models import Role, User
from apps.core.permissions import RoleAuth, can_manage_entry
from apps.startupdb.models import StartupEntry


class RoleAuthTests(HypothesisTestCase):
    """Property-based tests for the RoleAuth auth class."""

    @settings(deadline=None, max_examples=30)
    @given(
        role=st.sampled_from([r.value for r in Role]),
        allowed=st.lists(
            st.sampled_from([r.value for r in Role]),
            min_size=0,
            max_size=3,
            unique=True,
        ),
    )
    def test_role_auth_allows_access_if_role_in_allowed(
        self, role: str, allowed: list[str]
    ) -> None:
        """RoleAuth returns the user iff their role is in the allowed set."""
        user = User.objects.create_user(f"delivered+{role}@resend.dev", role=role)
        request = Mock()
        request.user = user

        auth = RoleAuth(*allowed)
        if role in allowed:
            assert auth(request) is user
        else:
            with pytest.raises(HttpError) as exc_info:
                auth(request)
            assert exc_info.value.status_code == 403

    def test_role_auth_returns_none_for_unauthenticated(self) -> None:
        """RoleAuth returns None (→ 401) when no user is authenticated."""
        request = Mock()
        request.user.is_authenticated = False
        assert RoleAuth("scout", "committee")(request) is None

    def test_role_auth_empty_allowed_denies_all(self) -> None:
        """RoleAuth with no roles denies everyone, even admins."""
        user = User.objects.create_user("delivered+anyone@resend.dev", role=Role.ADMIN)
        request = Mock()
        request.user = user

        with pytest.raises(HttpError) as exc_info:
            RoleAuth()(request)
        assert exc_info.value.status_code == 403


class CanManageEntryConcreteTests(TestCase):
    """Concrete tests for the ownership helper can_manage_entry."""

    def setUp(self) -> None:
        self.scout = User.objects.create_user(
            "delivered+scout@resend.dev", role=Role.SCOUT
        )
        self.member = User.objects.create_user("delivered+member@resend.dev")
        self.other = User.objects.create_user("delivered+other@resend.dev")

    def test_scout_owns_own_entry(self) -> None:
        """A scout who created an entry is its owner."""
        obj = StartupEntry(created_by=self.scout)
        assert can_manage_entry(self.scout, obj) is True

    def test_member_does_not_own_entry(self) -> None:
        """A plain member is never considered an owner, even if they
        created the object — only privileged roles can be owners."""
        obj = StartupEntry(created_by=self.member)
        assert can_manage_entry(self.member, obj) is False

    def test_admin_is_always_owner(self) -> None:
        """An admin is always considered an owner regardless of who
        created the object."""
        admin = User.objects.create_user("delivered+admin@resend.dev", role=Role.ADMIN)
        obj = StartupEntry(created_by=self.other)
        assert can_manage_entry(admin, obj) is True

    def test_stranger_is_not_owner(self) -> None:
        """A non-owner, non-admin user is not an owner."""
        obj = StartupEntry(created_by=self.scout)
        assert can_manage_entry(self.other, obj) is False

    def test_scout_is_not_owner_of_others(self) -> None:
        """A scout is not an owner of another scout's entry."""
        other_scout = User.objects.create_user(
            "delivered+other_scout@resend.dev", role=Role.SCOUT
        )
        obj = StartupEntry(created_by=other_scout)
        assert can_manage_entry(self.scout, obj) is False


class CanManageEntryPropertyTests(HypothesisTestCase):
    """Hypothesis property test over (role, is_owner) for can_manage_entry."""

    @settings(deadline=None, max_examples=30)
    @given(
        role=st.sampled_from([r.value for r in Role]),
        is_owner=st.booleans(),
    )
    def test_can_manage_entry_matrix(self, role: str, is_owner: bool) -> None:
        user = User.objects.create_user(f"delivered+{role}@resend.dev", role=role)
        obj = StartupEntry(
            created_by=user
            if is_owner
            else User.objects.create_user("delivered+other@resend.dev")
        )

        result = can_manage_entry(user, obj)

        expected = role == Role.ADMIN or (
            role in (Role.COMMITTEE, Role.SCOUT) and is_owner
        )
        assert result is expected
