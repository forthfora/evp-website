from __future__ import annotations

import time

import hypothesis.strategies as st
from django.test import TestCase
from hypothesis import given, settings
from hypothesis.extra.django import TestCase as HypothesisTestCase
from jwt_ninja import settings as jwt_settings
from jwt_ninja.cryptography import generate_jwt
from jwt_ninja.models import Session

from apps.accounts.models import Role, User


def _token_for_user(user: User) -> str:
    """Return a valid JWT access token for *user*."""
    session = Session.create_session(user=user, ip_address="127.0.0.1")
    now = int(time.time())
    payload = jwt_settings.jwt_settings.payload_class(
        user_id=user.id,
        type="access",
        exp=now + jwt_settings.jwt_settings.ACCESS_TOKEN_EXPIRE_SECONDS,
        session_id=session.id,
    )
    return generate_jwt(payload)


class MembersAPITests(TestCase):
    """Tests for the members list API endpoint."""

    def setUp(self) -> None:
        self.url = "/api/accounts/members"

        self.member = User.objects.create_user("member@test.com")
        self.member.role = Role.MEMBER
        self.member.save()

        self.scout = User.objects.create_user("scout@test.com")
        self.scout.role = Role.SCOUT
        self.scout.save()

        self.committee = User.objects.create_user("committee@test.com")
        self.committee.role = Role.COMMITTEE
        self.committee.save()

        self.admin = User.objects.create_user("admin@test.com")
        self.admin.role = Role.ADMIN
        self.admin.save()

        # Create some additional users to verify the full list is returned
        self.extra_member = User.objects.create_user("extra-member@test.com")
        self.extra_member.role = Role.MEMBER
        self.extra_member.save()

        self.extra_scout = User.objects.create_user("extra-scout@test.com")
        self.extra_scout.role = Role.SCOUT
        self.extra_scout.save()

    def _auth(self, user: User) -> dict:
        return {"HTTP_AUTHORIZATION": f"Bearer {_token_for_user(user)}"}

    def test_list_allowed_for_committee(self) -> None:
        """Committee can list all members."""
        resp = self.client.get(self.url, **self._auth(self.committee))
        assert resp.status_code == 200

    def test_list_allowed_for_admin(self) -> None:
        """Admin can list all members."""
        resp = self.client.get(self.url, **self._auth(self.admin))
        assert resp.status_code == 200

    def test_list_denied_for_member(self) -> None:
        """Plain member cannot list members."""
        resp = self.client.get(self.url, **self._auth(self.member))
        assert resp.status_code == 403

    def test_list_denied_for_scout(self) -> None:
        """Scout cannot list members."""
        resp = self.client.get(self.url, **self._auth(self.scout))
        assert resp.status_code == 403

    def test_list_requires_auth(self) -> None:
        """Unauthenticated request returns 401."""
        resp = self.client.get(self.url)
        assert resp.status_code == 401

    def test_list_returns_all_users(self) -> None:
        """The member list contains all users (not just a subset)."""
        resp = self.client.get(self.url, **self._auth(self.admin))
        assert resp.status_code == 200
        data = resp.json()
        # We created 6 users in setUp
        assert len(data) == 6

    def test_list_returns_expected_fields(self) -> None:
        """Each member entry has id, email, role, image, date_joined,
        receives_update_emails."""
        resp = self.client.get(self.url, **self._auth(self.admin))
        assert resp.status_code == 200
        data = resp.json()
        entry = data[0]
        assert "id" in entry
        assert "email" in entry
        assert "role" in entry
        assert "image" in entry
        assert "date_joined" in entry
        assert "receives_update_emails" in entry


class MembersPermissionPropertyTests(HypothesisTestCase):
    """Hypothesis property test over the role matrix for /api/accounts/members."""

    @settings(deadline=None, max_examples=30)
    @given(
        role=st.sampled_from([r.value for r in Role]),
    )
    def test_members_access_matrix(self, role: str) -> None:
        """Access is granted only for committee and admin roles."""
        user = User.objects.create_user(f"{role}@test.com")
        user.role = role
        user.save()

        session = Session.create_session(user=user, ip_address="127.0.0.1")
        now = int(time.time())
        payload = jwt_settings.jwt_settings.payload_class(
            user_id=user.id,
            type="access",
            exp=now + jwt_settings.jwt_settings.ACCESS_TOKEN_EXPIRE_SECONDS,
            session_id=session.id,
        )
        token = generate_jwt(payload)

        from django.test import Client

        client = Client()
        resp = client.get(
            "/api/accounts/members",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        if role in (Role.COMMITTEE, Role.ADMIN):
            assert resp.status_code == 200
        else:
            assert resp.status_code == 403
