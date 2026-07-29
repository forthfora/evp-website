from __future__ import annotations

from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from apps.newsletter.models import NewsletterIssue


class NewsletterIssueModelTests(TestCase):
    """Tests for the NewsletterIssue model."""

    def test_draft_excluded_from_published(self) -> None:
        """A draft (published_at=None) is not returned by published()."""
        draft = NewsletterIssue.objects.create(
            title="Draft Issue",
            body="Not yet published.",
        )
        assert draft.published_at is None
        assert NewsletterIssue.published().count() == 0

    def test_published_issue_included(self) -> None:
        """A published issue is returned by published()."""
        issue = NewsletterIssue.objects.create(
            title="Published Issue",
            body="Published content.",
            published_at=timezone.now(),
        )
        assert issue.published_at is not None
        assert NewsletterIssue.published().count() == 1

    def test_mixed_draft_and_published(self) -> None:
        """published() returns only published issues, not drafts."""
        NewsletterIssue.objects.create(title="Draft", body="Draft.")
        NewsletterIssue.objects.create(
            title="Live", body="Live.", published_at=timezone.now()
        )
        NewsletterIssue.objects.create(title="Draft 2", body="Draft 2.")
        NewsletterIssue.objects.create(
            title="Live 2", body="Live 2.", published_at=timezone.now()
        )
        assert NewsletterIssue.published().count() == 2

    def test_published_at_in_future_is_still_published(self) -> None:
        """An issue with a future published_at is still considered published."""
        future = timezone.now() + timedelta(days=7)
        NewsletterIssue.objects.create(
            title="Scheduled", body="Future.", published_at=future
        )
        assert NewsletterIssue.published().count() == 1

    def test_str_returns_title(self) -> None:
        """__str__ returns the issue title."""
        issue = NewsletterIssue.objects.create(title="My Issue", body="Body.")
        assert str(issue) == "My Issue"
