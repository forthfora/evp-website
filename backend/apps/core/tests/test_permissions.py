from __future__ import annotations

import hypothesis.strategies as st
import pytest
from django.test import TestCase
from hypothesis import given, settings
from hypothesis.extra.django import TestCase as HypothesisTestCase
from jwt_ninja.errors import APIError

from apps.accounts.models import Role, User
from apps.core.permissions import can_manage_entry, require_role
from apps.startupdb.models import StartupEntry


class RequireRoleTests(HypothesisTestCase):
    """Property-based tests for the role-based auth helper."""

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
    def test_require_role_allows_access_if_role_in_allowed(
        self, role: str, allowed: list[str]
    ) -> None:
        """require_role allows access iff the user's role is in the allowed set."""
        user = User.objects.create_user(f"{role}@test.com")
        user.role = role
        user.save()

        auth = require_role(*allowed)
        # Simulate: if we got to the role check, authentication already passed.
        # require_role.authenticate returns None if role is not allowed.
        from jwt_ninja.auth_classes import AuthDetails
        from jwt_ninja.models import Session

        session = Session.create_session(user=user, ip_address="127.0.0.1")
        details = AuthDetails(user=user, session=session)

        # We can't call authenticate directly without a real token, so we test
        # the check_roles helper instead.
        result = auth.check_roles(details)
        if role in allowed:
            assert result is True
        else:
            assert result is False

    def test_require_role_denies_unauthenticated(self) -> None:
        """require_role denies access when no auth is present."""
        auth = require_role("scout", "committee")
        from unittest.mock import Mock

        request = Mock()
        with pytest.raises(APIError):
            auth.authenticate(request, "bad-token")

    def test_require_role_empty_allowed_denies_all(self) -> None:
        """require_role with no roles denies everyone."""
        auth = require_role()
        user = User.objects.create_user("anyone@test.com")
        from jwt_ninja.auth_classes import AuthDetails
        from jwt_ninja.models import Session

        session = Session.create_session(user=user, ip_address="127.0.0.1")
        details = AuthDetails(user=user, session=session)
        assert auth.check_roles(details) is False

    def test_require_role_allows_committee(self) -> None:
        """committee role passes require_role('committee')."""
        user = User.objects.create_user("comm@test.com")
        user.role = Role.COMMITTEE
        user.save()
        auth = require_role("committee")
        from jwt_ninja.auth_classes import AuthDetails
        from jwt_ninja.models import Session

        session = Session.create_session(user=user, ip_address="127.0.0.1")
        details = AuthDetails(user=user, session=session)
        assert auth.check_roles(details) is True

    def test_require_role_allows_admin(self) -> None:
        """committee role passes require_role('admin')."""
        user = User.objects.create_user("admin@test.com")
        user.role = Role.ADMIN
        user.save()
        auth = require_role("admin")
        from jwt_ninja.auth_classes import AuthDetails
        from jwt_ninja.models import Session

        session = Session.create_session(user=user, ip_address="127.0.0.1")
        details = AuthDetails(user=user, session=session)
        assert auth.check_roles(details) is True


class IsOwnerOrCommitteeTests(TestCase):
    """Tests for the ownership helper."""

    def setUp(self) -> None:
        self.scout = User.objects.create_user("scout@test.com")
        self.scout.role = Role.SCOUT
        self.scout.save()
        self.member = User.objects.create_user("member@test.com")
        self.other = User.objects.create_user("other@test.com")

    def test_scout_owns_own_entry(self) -> None:
        """A scout who created an entry is its owner."""
        obj = StartupEntry(created_by=self.scout)
        assert can_manage_entry(self.scout, obj) is True

    def test_member_does_not_own_entry(self) -> None:
        """A plain member is never considered an owner, even if they
        created the object — only privileged roles can be owners."""
        obj = StartupEntry(created_by=self.member)
        assert can_manage_entry(self.member, obj) is False

    def test_committee_is_always_owner(self) -> None:
        """An admin member is always considered an owner regardless of
        who created the object."""
        self.member.role = Role.ADMIN
        self.member.save()
        obj = StartupEntry(created_by=self.other)
        assert can_manage_entry(self.member, obj) is True

    def test_stranger_is_not_owner(self) -> None:
        """A non-owner, non-admin user is not an owner."""
        obj = StartupEntry(created_by=self.scout)
        assert can_manage_entry(self.other, obj) is False

    def test_scout_is_not_owner_of_others(self) -> None:
        """A scout is not an owner of another scout's entry."""
        other_scout = User.objects.create_user("other_scout@test.com")
        other_scout.role = Role.SCOUT
        other_scout.save()
        obj = StartupEntry(created_by=other_scout)
        assert can_manage_entry(self.scout, obj) is False
