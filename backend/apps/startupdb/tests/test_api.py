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
from apps.core.permissions import can_manage_startup
from apps.startupdb.models import StartupEntry


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


class StartupAPITests(TestCase):
    """Tests for the startup entry API endpoints."""

    def setUp(self) -> None:
        self.startupdb_url = "/api/startupdb"

        self.member = User.objects.create_user("member@test.com")

        self.scout1 = User.objects.create_user("scout1@test.com")
        self.scout1.role = Role.SCOUT
        self.scout1.save()

        self.scout2 = User.objects.create_user("scout2@test.com")
        self.scout2.role = Role.SCOUT
        self.scout2.save()

        self.committee = User.objects.create_user("committee@test.com")
        self.committee.role = Role.COMMITTEE
        self.committee.save()

        self.admin = User.objects.create_user("admin@test.com")
        self.admin.role = Role.ADMIN
        self.admin.save()

        self.scout1_entry = StartupEntry.objects.create(
            name="Scout 1 Entry", created_by=self.scout1
        )

        self.scout2_entry = StartupEntry.objects.create(
            name="Scout 2 Entry", created_by=self.scout2
        )

        self.committee_entry = StartupEntry.objects.create(
            name="Committee Entry", created_by=self.committee
        )

        self.admin_entry = StartupEntry.objects.create(
            name="Admin Entry", created_by=self.admin
        )

    def _auth(self, user: User) -> dict:
        return {"HTTP_AUTHORIZATION": f"Bearer {_token_for_user(user)}"}

    def test_list_allowed_for_scout(self) -> None:
        resp = self.client.get(self.startupdb_url, **self._auth(self.scout1))
        assert resp.status_code == 200

    def test_list_allowed_for_committee(self) -> None:
        resp = self.client.get(self.startupdb_url, **self._auth(self.committee))
        assert resp.status_code == 200

    def test_list_allowed_for_admin(self) -> None:
        resp = self.client.get(self.startupdb_url, **self._auth(self.admin))
        assert resp.status_code == 200

    def test_list_denied_for_member(self) -> None:
        resp = self.client.get(self.startupdb_url, **self._auth(self.member))
        assert resp.status_code == 403

    def test_list_requires_auth(self) -> None:
        resp = self.client.get(self.startupdb_url)
        assert resp.status_code == 401

    def test_create_allowed_for_scout(self) -> None:
        resp = self.client.post(
            self.startupdb_url,
            {"name": "New Entry", "description": "By scout 1"},
            content_type="application/json",
            **self._auth(self.scout1),
        )
        assert resp.status_code == 200

    def test_create_allowed_for_committee(self) -> None:
        resp = self.client.post(
            self.startupdb_url,
            {"name": "New Entry", "description": "By committee"},
            content_type="application/json",
            **self._auth(self.committee),
        )
        assert resp.status_code == 200

    def test_create_allowed_for_admin(self) -> None:
        resp = self.client.post(
            self.startupdb_url,
            {"name": "New Entry", "description": "By admin"},
            content_type="application/json",
            **self._auth(self.admin),
        )
        assert resp.status_code == 200

    def test_create_denied_for_member(self) -> None:
        resp = self.client.post(
            self.startupdb_url,
            {"name": "New Entry"},
            content_type="application/json",
            **self._auth(self.member),
        )
        assert resp.status_code == 403

    def test_create_sets_created_by_server_side(self) -> None:
        """created_by is always set from the authenticated user, not the body."""
        resp = self.client.post(
            self.startupdb_url,
            {"name": "Server-Side", "description": "Test"},
            content_type="application/json",
            **self._auth(self.scout1),
        )
        assert resp.status_code == 200
        entry = StartupEntry.objects.get(name="Server-Side")
        assert entry.created_by == self.scout1

    def test_update_own_entry_as_scout(self) -> None:
        resp = self.client.patch(
            f"{self.startupdb_url}/{self.scout1_entry.id}",
            {"name": "Updated by owner"},
            content_type="application/json",
            **self._auth(self.scout1),
        )
        assert resp.status_code == 200

    def test_update_own_entry_as_committee(self) -> None:
        resp = self.client.patch(
            f"{self.startupdb_url}/{self.committee_entry.id}",
            {"name": "Updated by committee"},
            content_type="application/json",
            **self._auth(self.committee),
        )
        assert resp.status_code == 200

    def test_update_any_entry_as_admin(self) -> None:
        resp = self.client.patch(
            f"{self.startupdb_url}/{self.scout1_entry.id}",
            {"name": "Updated by admin"},
            content_type="application/json",
            **self._auth(self.admin),
        )
        assert resp.status_code == 200

        resp = self.client.patch(
            f"{self.startupdb_url}/{self.committee_entry.id}",
            {"name": "Updated by admin"},
            content_type="application/json",
            **self._auth(self.admin),
        )
        assert resp.status_code == 200

        resp = self.client.patch(
            f"{self.startupdb_url}/{self.admin_entry.id}",
            {"name": "Updated by admin"},
            content_type="application/json",
            **self._auth(self.admin),
        )
        assert resp.status_code == 200

    def test_update_other_entry_as_scout_denied(self) -> None:
        resp = self.client.patch(
            f"{self.startupdb_url}/{self.scout2_entry.id}",
            {"name": "Hacked"},
            content_type="application/json",
            **self._auth(self.scout1),
        )
        assert resp.status_code == 403

    def test_delete_own_entry_as_scout(self) -> None:
        resp = self.client.delete(
            f"{self.startupdb_url}/{self.scout1_entry.id}",
            **self._auth(self.scout1),
        )
        assert resp.status_code == 204

    def test_delete_any_entry_as_admin(self) -> None:
        resp = self.client.delete(
            f"{self.startupdb_url}/{self.scout1_entry.id}",
            **self._auth(self.admin),
        )
        assert resp.status_code == 204

        resp = self.client.delete(
            f"{self.startupdb_url}/{self.committee_entry.id}",
            **self._auth(self.admin),
        )
        assert resp.status_code == 204

        resp = self.client.delete(
            f"{self.startupdb_url}/{self.admin_entry.id}",
            **self._auth(self.admin),
        )
        assert resp.status_code == 204

    def test_delete_scout_entry_as_committee_denied(self) -> None:
        resp = self.client.delete(
            f"{self.startupdb_url}/{self.scout1_entry.id}",
            **self._auth(self.committee),
        )
        assert resp.status_code == 403

    def test_delete_other_entry_as_scout_denied(self) -> None:
        resp = self.client.delete(
            f"{self.startupdb_url}/{self.scout2_entry.id}",
            **self._auth(self.scout1),
        )
        assert resp.status_code == 403


class StartupPermissionsPropertyTests(HypothesisTestCase):
    """Hypothesis property test over (role, is_owner) for the ownership helper."""

    @settings(deadline=None, max_examples=30)
    @given(
        role=st.sampled_from([r.value for r in Role]),
        is_owner=st.booleans(),
    )
    def test_can_manage_startup_matrix(self, role: str, is_owner: bool) -> None:
        user = User.objects.create_user(f"{role}-{is_owner}@test.com")
        user.role = role
        user.save()

        entry = StartupEntry()
        entry.created_by = (
            user if is_owner else User.objects.create_user("other@test.com")
        )

        result = can_manage_startup(user, entry)

        if (
            role == Role.ADMIN
            or (role == Role.COMMITTEE and is_owner)
            or (role == Role.SCOUT and is_owner)
        ):
            assert result is True
        else:
            assert result is False
