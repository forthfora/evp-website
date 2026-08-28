from unittest.mock import patch

import hypothesis.strategies as st
from django.test import TestCase
from hypothesis import given, settings
from hypothesis.extra.django import TestCase as HypothesisTestCase

from apps.accounts.models import Role, User
from apps.core.email import EmailSendError


class MembersAPITests(TestCase):
    """Tests for the members list API endpoint."""

    def setUp(self) -> None:
        self.url = "/api/accounts/members"

        self.member = User.objects.create_user(
            "delivered+member@resend.dev", role=Role.MEMBER
        )
        self.scout = User.objects.create_user(
            "delivered+scout@resend.dev", role=Role.SCOUT
        )
        self.committee = User.objects.create_user(
            "delivered+committee@resend.dev", role=Role.COMMITTEE
        )
        self.admin = User.objects.create_user(
            "delivered+admin@resend.dev", role=Role.ADMIN
        )

        # Create some additional users to verify the full list is returned
        self.extra_member = User.objects.create_user(
            "delivered+extra-member@resend.dev", role=Role.MEMBER
        )
        self.extra_scout = User.objects.create_user(
            "delivered+extra-scout@resend.dev", role=Role.SCOUT
        )

    def _login(self, user: User) -> None:
        self.client.force_login(user)

    def test_list_allowed_for_committee(self) -> None:
        """Committee can list all members."""
        self._login(self.committee)
        resp = self.client.get(self.url)
        assert resp.status_code == 200

    def test_list_allowed_for_admin(self) -> None:
        """Admin can list all members."""
        self._login(self.admin)
        resp = self.client.get(self.url)
        assert resp.status_code == 200

    def test_list_denied_for_member(self) -> None:
        """Plain member cannot list members."""
        self._login(self.member)
        resp = self.client.get(self.url)
        assert resp.status_code == 403

    def test_list_denied_for_scout(self) -> None:
        """Scout cannot list members."""
        self._login(self.scout)
        resp = self.client.get(self.url)
        assert resp.status_code == 403

    def test_list_requires_auth(self) -> None:
        """Unauthenticated request returns 401."""
        resp = self.client.get(self.url)
        assert resp.status_code == 401

    def test_list_returns_all_users(self) -> None:
        """The member list contains all users (not just a subset)."""
        self._login(self.admin)
        resp = self.client.get(self.url)
        assert resp.status_code == 200
        # We created 6 users in setUp
        assert len(resp.json()) == 6

    def test_list_returns_expected_fields(self) -> None:
        """Each member entry has username, email, role, date_joined and
        receives_update_emails (no internal DB id)."""
        self._login(self.admin)
        resp = self.client.get(self.url)
        assert resp.status_code == 200
        entry = resp.json()[0]
        for field in (
            "username",
            "email",
            "role",
            "date_joined",
            "receives_update_emails",
        ):
            assert field in entry
        assert "id" not in entry


class MembersPermissionPropertyTests(HypothesisTestCase):
    """Hypothesis property test over the role matrix for /api/accounts/members."""

    @settings(deadline=None, max_examples=30)
    @given(
        role=st.sampled_from([r.value for r in Role]),
    )
    def test_members_access_matrix(self, role: str) -> None:
        """Access is granted only for committee and admin roles."""
        user = User.objects.create_user(f"delivered+{role}@resend.dev", role=role)
        self.client.force_login(user)
        resp = self.client.get("/api/accounts/members")

        if role in (Role.COMMITTEE, Role.ADMIN):
            assert resp.status_code == 200
        else:
            assert resp.status_code == 403


class SendAllEmailsTests(TestCase):
    """Tests for the admin-only /api/accounts/sendall endpoint."""

    def setUp(self) -> None:
        self.url = "/api/accounts/sendall"

        self.admin = User.objects.create_user(
            "delivered+admin@resend.dev", role=Role.ADMIN
        )
        self.committee = User.objects.create_user(
            "delivered+committee@resend.dev", role=Role.COMMITTEE
        )
        self.opted_in = User.objects.create_user(
            "delivered+opt-in@resend.dev", role=Role.MEMBER
        )
        self.opted_out = User.objects.create_user(
            "delivered+opt-out@resend.dev", role=Role.MEMBER
        )
        self.opted_out.receives_update_emails = False
        self.opted_out.save()

    def _post(self):
        return self.client.post(
            self.url,
            {
                "subject": "evp-website SendAllEmails Test",
                "body": "This is a test of evp-website's SendAll functionality.",
            },
            content_type="application/json",
        )

    def test_sendall_allowed_for_admin(self) -> None:
        """Only admins can send to all members."""
        self.client.force_login(self.admin)
        assert self._post().status_code == 200

    def test_sendall_denied_for_committee(self) -> None:
        """Committee is not allowed to use sendall."""
        self.client.force_login(self.committee)
        assert self._post().status_code == 403

    def test_sendall_requires_auth(self) -> None:
        """Unauthenticated request returns 401."""
        assert self._post().status_code == 401

    @patch("apps.accounts.api.send_email")
    def test_sendall_sends_to_opted_in_only(self, mock_send) -> None:
        """Emails go to opted-in users only; opted-out users are skipped."""
        self.client.force_login(self.admin)
        resp = self._post()
        assert resp.status_code == 200
        data = resp.json()
        assert data["sent"] == 3
        assert data["skipped"] == 1
        assert data["failed"] == 0

        sent_to = {call.kwargs["to"] for call in mock_send.call_args_list}
        assert sent_to == {
            "delivered+admin@resend.dev",
            "delivered+committee@resend.dev",
            "delivered+opt-in@resend.dev",
        }

    @patch("apps.accounts.api.send_email")
    def test_sendall_counts_failures(self, mock_send) -> None:
        """Failures are counted rather than aborting the whole send."""
        self.client.force_login(self.admin)
        mock_send.side_effect = EmailSendError("smtp down")

        resp = self._post()
        assert resp.status_code == 200
        data = resp.json()
        assert data["sent"] == 0
        assert data["skipped"] == 1
        assert data["failed"] == 3
