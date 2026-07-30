from __future__ import annotations

import time
from unittest.mock import patch

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


class UpdateEmailAPITests(TestCase):
    """Tests for the admin update-email endpoint."""

    def setUp(self) -> None:
        self.url = "/api/updates/send"

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

    def _auth(self, user: User) -> dict:
        return {"HTTP_AUTHORIZATION": f"Bearer {_token_for_user(user)}"}

    def test_send_requires_auth(self) -> None:
        """Unauthenticated request returns 401."""
        resp = self.client.post(
            self.url,
            {"subject": "Hi", "body": "Hello"},
            content_type="application/json",
        )
        assert resp.status_code == 401

    def test_send_denied_for_member(self) -> None:
        """Plain member cannot send updates."""
        resp = self.client.post(
            self.url,
            {"subject": "Hi", "body": "Hello"},
            content_type="application/json",
            **self._auth(self.member),
        )
        assert resp.status_code == 403

    def test_send_denied_for_scout(self) -> None:
        """Scout cannot send updates."""
        resp = self.client.post(
            self.url,
            {"subject": "Hi", "body": "Hello"},
            content_type="application/json",
            **self._auth(self.scout),
        )
        assert resp.status_code == 403

    def test_send_denied_for_committee(self) -> None:
        """Committee cannot send updates."""
        resp = self.client.post(
            self.url,
            {"subject": "Hi", "body": "Hello"},
            content_type="application/json",
            **self._auth(self.committee),
        )
        assert resp.status_code == 403

    @patch("apps.updates.api.send_email")
    def test_send_allowed_for_admin(self, mock_send_email) -> None:
        """Admin can send updates; send_email is called for each member."""
        mock_send_email.return_value = type(
            "Result", (), {"success": True, "message": "ok"}
        )()

        resp = self.client.post(
            self.url,
            {"subject": "Test Subject", "body": "Test body"},
            content_type="application/json",
            **self._auth(self.admin),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["subject"] == "Test Subject"
        assert data["body"] == "Test body"
        # 4 users in setUp
        assert data["sent"] == 4
        assert data["skipped"] == 0
        assert data["failed"] == 0
        assert mock_send_email.call_count == 4

    @patch("apps.updates.api.send_email")
    def test_send_skips_opted_out_users(self, mock_send_email) -> None:
        """Users with receives_update_emails=False are skipped."""
        mock_send_email.return_value = type(
            "Result", (), {"success": True, "message": "ok"}
        )()

        # Opt one user out
        self.member.receives_update_emails = False
        self.member.save()

        resp = self.client.post(
            self.url,
            {"subject": "Hi", "body": "Hello"},
            content_type="application/json",
            **self._auth(self.admin),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["sent"] == 3  # 4 users - 1 opted out
        assert data["skipped"] == 1
        assert data["failed"] == 0
        assert mock_send_email.call_count == 3

    @patch("apps.updates.api.send_email")
    def test_send_reports_failures(self, mock_send_email) -> None:
        """Failed sends are counted in the failed field."""
        mock_send_email.side_effect = [
            type("Result", (), {"success": True, "message": "ok"})(),
            type("Result", (), {"success": False, "message": "error"})(),
            type("Result", (), {"success": True, "message": "ok"})(),
            type("Result", (), {"success": False, "message": "error"})(),
        ]

        resp = self.client.post(
            self.url,
            {"subject": "Hi", "body": "Hello"},
            content_type="application/json",
            **self._auth(self.admin),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["sent"] == 2
        assert data["skipped"] == 0
        assert data["failed"] == 2

    @patch("apps.updates.api.send_email")
    def test_send_no_members_left(self, mock_send_email) -> None:
        """If all users have opted out, sent and failed are 0."""
        User.objects.all().update(receives_update_emails=False)

        resp = self.client.post(
            self.url,
            {"subject": "Hi", "body": "Hello"},
            content_type="application/json",
            **self._auth(self.admin),
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["sent"] == 0
        assert data["skipped"] == 4
        assert data["failed"] == 0
        mock_send_email.assert_not_called()


class UpdateEmailPermissionPropertyTests(HypothesisTestCase):
    """Hypothesis property test over the role matrix for /api/updates/send."""

    @settings(deadline=None, max_examples=30)
    @given(
        role=st.sampled_from([r.value for r in Role]),
    )
    @patch("apps.updates.api.send_email")
    def test_send_access_matrix(self, mock_send_email, role: str) -> None:
        """Access is granted only for admin role."""
        mock_send_email.return_value = type(
            "Result", (), {"success": True, "message": "ok"}
        )()

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
        resp = client.post(
            "/api/updates/send",
            {"subject": "Test", "body": "Body"},
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        if role == Role.ADMIN:
            assert resp.status_code == 200
        else:
            assert resp.status_code == 403
