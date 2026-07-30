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
from apps.core.permissions import is_owner_or_committee
from apps.directory.models import DirectoryEntry


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


class DirectoryAPITests(TestCase):
    """Tests for the directory entry API endpoints."""

    def setUp(self) -> None:
        self.entries_url = "/api/entries"

        self.member = User.objects.create_user("member@test.com")
        self.scout = User.objects.create_user("scout@test.com")
        self.scout.role = Role.SCOUT
        self.scout.save()
        self.committee = User.objects.create_user("committee@test.com")
        self.committee.role = Role.COMMITTEE
        self.committee.save()

        # Scout's own entry
        self.scout_entry = DirectoryEntry.objects.create(
            title="Scout Entry", created_by=self.scout
        )
        # Another scout's entry (for ownership tests)
        self.other_entry = DirectoryEntry.objects.create(
            title="Other Entry", created_by=self.committee
        )

    def _auth(self, user: User) -> dict:
        return {"HTTP_AUTHORIZATION": f"Bearer {_token_for_user(user)}"}

    def test_list_allowed_for_scout(self) -> None:
        resp = self.client.get(self.entries_url, **self._auth(self.scout))
        assert resp.status_code == 200

    def test_list_allowed_for_committee(self) -> None:
        resp = self.client.get(self.entries_url, **self._auth(self.committee))
        assert resp.status_code == 200

    def test_list_denied_for_member(self) -> None:
        resp = self.client.get(self.entries_url, **self._auth(self.member))
        assert resp.status_code == 403

    def test_list_requires_auth(self) -> None:
        resp = self.client.get(self.entries_url)
        assert resp.status_code == 401

    def test_create_allowed_for_scout(self) -> None:
        resp = self.client.post(
            self.entries_url,
            {"title": "New Entry", "description": "By scout"},
            content_type="application/json",
            **self._auth(self.scout),
        )
        assert resp.status_code == 200

    def test_create_allowed_for_committee(self) -> None:
        resp = self.client.post(
            self.entries_url,
            {"title": "New Entry", "description": "By committee"},
            content_type="application/json",
            **self._auth(self.committee),
        )
        assert resp.status_code == 200

    def test_create_denied_for_member(self) -> None:
        resp = self.client.post(
            self.entries_url,
            {"title": "New Entry"},
            content_type="application/json",
            **self._auth(self.member),
        )
        assert resp.status_code == 403

    def test_create_sets_created_by_server_side(self) -> None:
        """created_by is always set from the authenticated user, not the body."""
        resp = self.client.post(
            self.entries_url,
            {"title": "Server-Side", "description": "Test"},
            content_type="application/json",
            **self._auth(self.scout),
        )
        assert resp.status_code == 200
        entry = DirectoryEntry.objects.get(title="Server-Side")
        assert entry.created_by == self.scout

    def test_update_own_entry_as_scout(self) -> None:
        resp = self.client.patch(
            f"{self.entries_url}/{self.scout_entry.id}",
            {"title": "Updated by owner"},
            content_type="application/json",
            **self._auth(self.scout),
        )
        assert resp.status_code == 200

    def test_update_scout_entry_as_committee(self) -> None:
        resp = self.client.patch(
            f"{self.entries_url}/{self.scout_entry.id}",
            {"title": "Updated by committee"},
            content_type="application/json",
            **self._auth(self.committee),
        )
        assert resp.status_code == 200

    def test_update_other_entry_as_scout_denied(self) -> None:
        resp = self.client.patch(
            f"{self.entries_url}/{self.other_entry.id}",
            {"title": "Hacked"},
            content_type="application/json",
            **self._auth(self.scout),
        )
        assert resp.status_code == 403

    def test_delete_own_entry_as_scout(self) -> None:
        resp = self.client.delete(
            f"{self.entries_url}/{self.scout_entry.id}",
            **self._auth(self.scout),
        )
        assert resp.status_code == 204

    def test_delete_scout_entry_as_committee(self) -> None:
        resp = self.client.delete(
            f"{self.entries_url}/{self.scout_entry.id}",
            **self._auth(self.committee),
        )
        assert resp.status_code == 204

    def test_delete_other_entry_as_scout_denied(self) -> None:
        resp = self.client.delete(
            f"{self.entries_url}/{self.other_entry.id}",
            **self._auth(self.scout),
        )
        assert resp.status_code == 403


class DirectoryPermissionsPropertyTests(HypothesisTestCase):
    """Hypothesis property test over (role, is_owner) for the ownership helper."""

    @settings(deadline=None, max_examples=30)
    @given(
        role=st.sampled_from([r.value for r in Role]),
        is_owner=st.booleans(),
    )
    def test_is_owner_or_committee_matrix(self, role: str, is_owner: bool) -> None:
        """is_owner_or_committee allows access iff role == committee OR
        (role == scout AND is_owner).  Members are always denied."""
        user = User.objects.create_user(f"{role}-{is_owner}@test.com")
        user.role = role
        user.save()

        obj = (
            type("Obj", (), {"created_by": user})()
            if is_owner
            else type(
                "Obj", (), {"created_by": User.objects.create_user("other@test.com")}
            )()
        )

        result = is_owner_or_committee(user, obj)

        if role == Role.COMMITTEE or (role == Role.SCOUT and is_owner):
            assert result is True
        else:
            assert result is False
