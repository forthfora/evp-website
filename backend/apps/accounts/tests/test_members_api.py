from datetime import timedelta
from unittest.mock import patch

import hypothesis.strategies as st
from django.core.cache import cache
from django.test import TestCase
from django.utils import timezone
from freezegun import freeze_time
from hypothesis import given, settings
from hypothesis.extra.django import TestCase as HypothesisTestCase

from apps.accounts.api import _dispatch_update_emails
from apps.accounts.models import Role, SendAllJob, User
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
        # Clear the (per-process) rate-limit cache: sendall is limited to
        # 3/10m and counts would otherwise leak between tests.
        cache.clear()

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

    @patch("apps.accounts.api.threading.Thread")
    def test_sendall_allowed_for_admin(self, mock_thread) -> None:
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

    @patch("apps.accounts.api.threading.Thread")
    def test_sendall_returns_queued_and_skipped_counts(self, mock_thread) -> None:
        """The response returns immediately with queued/skipped counts and a
        job id; delivery happens in a background thread (per-recipient email
        round-trips must not hold the request open past the worker
        timeout)."""
        self.client.force_login(self.admin)
        resp = self._post()
        assert resp.status_code == 200
        data = resp.json()
        assert data["queued"] == 3
        assert data["skipped"] == 1

        # A SendAllJob row tracks delivery progress for the UI to poll.
        job = SendAllJob.objects.get(pk=data["job_id"])
        assert job.total == 3
        assert job.sent == 0
        assert job.failed == 0
        assert job.created_by == self.admin
        assert job.finished_at is None

    @patch("apps.accounts.api.threading.Thread")
    def test_sendall_rejects_overlong_subject(self, mock_thread) -> None:
        """Subjects longer than SendAllJob.subject's 255 chars are a 422,
        not a database DataError 500."""
        self.client.force_login(self.admin)
        resp = self.client.post(
            self.url,
            {"subject": "x" * 256, "body": "hello"},
            content_type="application/json",
        )
        assert resp.status_code == 422
        assert SendAllJob.objects.count() == 0

    @patch("apps.accounts.api.threading.Thread")
    def test_sendall_sanitises_html_body(self, mock_thread) -> None:
        """Script tags, event handlers, and javascript: URLs are stripped
        from the body before it is echoed back or queued for delivery."""
        self.client.force_login(self.admin)

        resp = self.client.post(
            self.url,
            {
                "subject": "Test",
                "body": '<p>Hi</p><script>alert("xss")</script>'
                '<img src="x.png" onerror="alert(1)">'
                '<a href="javascript:alert(2)">click</a>',
            },
            content_type="application/json",
        )
        assert resp.status_code == 200

        # The echoed body in the response is the sanitised one.
        assert "<script>" not in resp.json()["body"]
        assert "<p>Hi</p>" in resp.json()["body"]

    @patch("apps.accounts.api.send_email")
    def test_dispatch_sends_sanitised_body_to_each_recipient(self, mock_send) -> None:
        """The background dispatcher sends one email per recipient, carrying
        the sanitised body and the pre-resolved greeting name (no
        per-recipient database lookups), and tracks progress on the job."""
        job = SendAllJob.objects.create(created_by=self.admin, subject="Test", total=2)
        safe_body = "<p>Hi</p>"
        _dispatch_update_emails(
            job.pk,
            "Test",
            safe_body,
            [
                ("delivered+opt-in@resend.dev", "Ada"),
                ("delivered+admin@resend.dev", ""),
            ],
        )

        assert mock_send.call_count == 2
        sent_to = {call.kwargs["to"] for call in mock_send.call_args_list}
        assert sent_to == {
            "delivered+opt-in@resend.dev",
            "delivered+admin@resend.dev",
        }
        for call in mock_send.call_args_list:
            assert call.kwargs["body"] == safe_body
            assert call.kwargs["subject"] == "Test"
            assert "greeting_name" in call.kwargs

        # Greeting names are passed through for personalisation.
        names = {
            c.kwargs["to"]: c.kwargs["greeting_name"] for c in mock_send.call_args_list
        }
        assert names["delivered+opt-in@resend.dev"] == "Ada"
        assert names["delivered+admin@resend.dev"] == ""

        # Delivery results are recorded on the job row.
        job.refresh_from_db()
        assert job.sent == 2
        assert job.failed == 0
        assert job.finished_at is not None

    @patch("apps.accounts.api.send_email")
    def test_dispatch_continues_after_failures(self, mock_send) -> None:
        """A failing recipient is logged and counted on the job; the
        dispatcher keeps sending to the remaining recipients."""
        mock_send.side_effect = EmailSendError("smtp down")
        job = SendAllJob.objects.create(created_by=self.admin, subject="Test", total=2)

        # Must not raise, and must attempt every recipient.
        _dispatch_update_emails(
            job.pk,
            "Test",
            "<p>Hi</p>",
            [
                ("delivered+opt-in@resend.dev", "Ada"),
                ("delivered+admin@resend.dev", ""),
            ],
        )
        assert mock_send.call_count == 2

        job.refresh_from_db()
        assert job.sent == 0
        assert job.failed == 2
        assert job.finished_at is not None

    @patch("apps.accounts.api.send_email")
    def test_dispatch_counts_partial_failures(self, mock_send) -> None:
        """Mixed outcomes are reflected per-recipient on the job row."""
        mock_send.side_effect = [EmailSendError("smtp down"), None]
        job = SendAllJob.objects.create(created_by=self.admin, subject="Test", total=2)

        _dispatch_update_emails(
            job.pk,
            "Test",
            "<p>Hi</p>",
            [
                ("delivered+opt-in@resend.dev", "Ada"),
                ("delivered+admin@resend.dev", ""),
            ],
        )

        job.refresh_from_db()
        assert job.sent == 1
        assert job.failed == 1
        assert job.finished_at is not None


class SendAllJobStatusTests(TestCase):
    """Tests for the admin-only send-all job status endpoints."""

    def setUp(self) -> None:
        cache.clear()

        self.list_url = "/api/accounts/sendall/jobs"

        self.admin = User.objects.create_user(
            "delivered+admin@resend.dev", role=Role.ADMIN
        )
        self.committee = User.objects.create_user(
            "delivered+committee@resend.dev", role=Role.COMMITTEE
        )

        self.job = SendAllJob.objects.create(
            created_by=self.admin, subject="Update", total=3, sent=2, failed=1
        )
        SendAllJob.objects.filter(pk=self.job.pk).update(
            finished_at=timezone.now() - timedelta(minutes=1)
        )
        self.job.refresh_from_db()

    def _job_url(self, job: SendAllJob) -> str:
        return f"{self.list_url}/{job.pk}"

    def test_job_status_allowed_for_admin(self) -> None:
        """Admins can poll a job's delivery progress and results."""
        self.client.force_login(self.admin)
        resp = self.client.get(self._job_url(self.job))
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == self.job.pk
        assert data["subject"] == "Update"
        assert data["total"] == 3
        assert data["sent"] == 2
        assert data["failed"] == 1
        assert data["finished_at"] is not None
        assert "created_at" in data

    def test_job_status_denied_for_committee(self) -> None:
        """Committee cannot poll send-all job status."""
        self.client.force_login(self.committee)
        assert self.client.get(self._job_url(self.job)).status_code == 403

    def test_job_status_requires_auth(self) -> None:
        """Unauthenticated requests return 401."""
        assert self.client.get(self._job_url(self.job)).status_code == 401

    def test_job_status_404_for_unknown_job(self) -> None:
        """An unknown job id returns 404."""
        self.client.force_login(self.admin)
        assert self.client.get(f"{self.list_url}/99999").status_code == 404

    def test_job_list_returns_recent_jobs_newest_first(self) -> None:
        """The list endpoint returns recent jobs, newest first."""
        with freeze_time(timezone.now() - timedelta(minutes=5)):
            SendAllJob.objects.create(
                created_by=self.admin, subject="Older", total=1, sent=1
            )

        self.client.force_login(self.admin)
        resp = self.client.get(self.list_url)
        assert resp.status_code == 200
        subjects = [job["subject"] for job in resp.json()]
        assert subjects == ["Update", "Older"]
