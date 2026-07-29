from __future__ import annotations

import time
from unittest.mock import patch

from django.test import TestCase
from django.utils import timezone
from jwt_ninja import settings as jwt_settings
from jwt_ninja.cryptography import generate_jwt
from jwt_ninja.models import Session

from apps.accounts.models import Role, User
from apps.newsletter.models import NewsletterIssue


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


class NewsletterAPITests(TestCase):
    """Tests for the newsletter API endpoints."""

    def setUp(self) -> None:
        self.list_url = "/api/newsletter/issues"

        # Users with different roles
        self.member = User.objects.create_user("member@test.com")
        self.scout = User.objects.create_user("scout@test.com")
        self.scout.role = Role.SCOUT
        self.scout.save()
        self.committee = User.objects.create_user("committee@test.com")
        self.committee.role = Role.COMMITTEE
        self.committee.save()

        # Sample issues
        self.draft = NewsletterIssue.objects.create(title="Draft", body="Unpublished.")
        self.published = NewsletterIssue.objects.create(
            title="Live", body="Published.", published_at=timezone.now()
        )

    def _auth_header(self, user: User) -> dict:
        return {"HTTP_AUTHORIZATION": f"Bearer {_token_for_user(user)}"}

    def test_list_returns_only_published(self) -> None:
        """GET returns only published issues."""
        resp = self.client.get(self.list_url, **self._auth_header(self.member))
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["title"] == "Live"

    def test_list_requires_auth(self) -> None:
        """GET returns 401 for unauthenticated requests."""
        resp = self.client.get(self.list_url)
        assert resp.status_code == 401

    def test_list_works_for_all_roles(self) -> None:
        """GET works for any authenticated user regardless of role."""
        for user in (self.member, self.scout, self.committee):
            resp = self.client.get(self.list_url, **self._auth_header(user))
            assert resp.status_code == 200

    def test_create_allowed_for_committee(self) -> None:
        """POST succeeds for committee members."""
        resp = self.client.post(
            self.list_url,
            {"title": "New", "body": "Body."},
            content_type="application/json",
            **self._auth_header(self.committee),
        )
        assert resp.status_code == 200
        assert NewsletterIssue.objects.count() == 3

    def test_create_denied_for_member(self) -> None:
        """POST returns 403 for plain members."""
        resp = self.client.post(
            self.list_url,
            {"title": "New", "body": "Body."},
            content_type="application/json",
            **self._auth_header(self.member),
        )
        assert resp.status_code == 403

    def test_create_denied_for_scout(self) -> None:
        """POST returns 403 for scouts."""
        resp = self.client.post(
            self.list_url,
            {"title": "New", "body": "Body."},
            content_type="application/json",
            **self._auth_header(self.scout),
        )
        assert resp.status_code == 403

    def test_update_allowed_for_committee(self) -> None:
        """PATCH succeeds for committee members."""
        resp = self.client.patch(
            f"{self.list_url}/{self.draft.id}",
            {"title": "Updated"},
            content_type="application/json",
            **self._auth_header(self.committee),
        )
        assert resp.status_code == 200
        self.draft.refresh_from_db()
        assert self.draft.title == "Updated"

    def test_update_denied_for_member(self) -> None:
        """PATCH returns 403 for plain members."""
        resp = self.client.patch(
            f"{self.list_url}/{self.draft.id}",
            {"title": "Updated"},
            content_type="application/json",
            **self._auth_header(self.member),
        )
        assert resp.status_code == 403

    def test_delete_allowed_for_committee(self) -> None:
        """DELETE succeeds for committee members."""
        resp = self.client.delete(
            f"{self.list_url}/{self.draft.id}",
            **self._auth_header(self.committee),
        )
        assert resp.status_code == 204
        assert NewsletterIssue.objects.count() == 1

    def test_delete_denied_for_member(self) -> None:
        """DELETE returns 403 for plain members."""
        resp = self.client.delete(
            f"{self.list_url}/{self.draft.id}",
            **self._auth_header(self.member),
        )
        assert resp.status_code == 403


class NewsletterPublishNotificationTests(TestCase):
    """Tests for publish notification emails (T13)."""

    def setUp(self) -> None:
        self.list_url = "/api/newsletter/issues"
        self.committee = User.objects.create_user("comm@test.com")
        self.committee.role = Role.COMMITTEE
        self.committee.receives_newsletter_emails = False  # no self-notify
        self.committee.save()

        self.subscriber = User.objects.create_user("sub@test.com")
        self.subscriber2 = User.objects.create_user("sub2@test.com")
        self.unsubscribed = User.objects.create_user("unsub@test.com")
        self.unsubscribed.receives_newsletter_emails = False
        self.unsubscribed.save()

        self.draft = NewsletterIssue.objects.create(
            title="Draft", body="Should notify on publish."
        )

    def _auth_header(self, user: User) -> dict:
        return {"HTTP_AUTHORIZATION": f"Bearer {_token_for_user(user)}"}

    @patch("apps.newsletter.api.send_email")
    def test_publish_triggers_notification(self, mock_send) -> None:
        """Publishing an issue (published_at set) sends email to subscribed users."""
        resp = self.client.patch(
            f"{self.list_url}/{self.draft.id}",
            {"published_at": timezone.now().isoformat()},
            content_type="application/json",
            **self._auth_header(self.committee),
        )
        assert resp.status_code == 200

        # One call per subscribed user (committee unsubscribed; skips unsubscribed)
        assert mock_send.call_count == 2  # subscriber + subscriber2
        recipients = {call.kwargs["to"] for call in mock_send.call_args_list}
        assert self.subscriber.email in recipients
        assert self.subscriber2.email in recipients
        assert self.unsubscribed.email not in recipients

    @patch("apps.newsletter.api.send_email")
    def test_update_already_published_does_not_re_notify(self, mock_send) -> None:
        """Updating an already-published issue does not trigger notification."""
        published = NewsletterIssue.objects.create(
            title="Live", body="Already published.", published_at=timezone.now()
        )

        # Update the title only (not a new publish)
        resp = self.client.patch(
            f"{self.list_url}/{published.id}",
            {"title": "Updated Title"},
            content_type="application/json",
            **self._auth_header(self.committee),
        )
        assert resp.status_code == 200
        mock_send.assert_not_called()

    @patch("apps.newsletter.api.send_email")
    def test_unsubscribed_users_not_notified(self, mock_send) -> None:
        """Users with receives_newsletter_emails=False are skipped."""
        resp = self.client.patch(
            f"{self.list_url}/{self.draft.id}",
            {"published_at": timezone.now().isoformat()},
            content_type="application/json",
            **self._auth_header(self.committee),
        )
        assert resp.status_code == 200

        assert mock_send.call_count == 2  # subscriber + subscriber2
        recipients = {call.kwargs["to"] for call in mock_send.call_args_list}
        assert self.unsubscribed.email not in recipients
