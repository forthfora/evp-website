from __future__ import annotations

import pytest
from django.db import IntegrityError
from django.test import TestCase

from apps.accounts.models import User
from apps.directory.models import DirectoryEntry


class DirectoryEntryModelTests(TestCase):
    """Tests for the DirectoryEntry model."""

    def setUp(self) -> None:
        self.user = User.objects.create_user("entry-owner@test.com")

    def test_default_extra_is_empty_dict(self) -> None:
        """extra field defaults to an empty dict."""
        entry = DirectoryEntry.objects.create(
            title="Test Entry", created_by=self.user
        )
        assert entry.extra == {}

    def test_description_defaults_to_blank(self) -> None:
        """description field is blank by default."""
        entry = DirectoryEntry.objects.create(
            title="Test Entry", created_by=self.user
        )
        assert entry.description == ""

    def test_created_by_is_required(self) -> None:
        """Creating an entry without created_by raises IntegrityError."""
        with pytest.raises(IntegrityError):
            DirectoryEntry.objects.create(title="Orphan Entry")

    def test_str_returns_title(self) -> None:
        """__str__ returns the entry title."""
        entry = DirectoryEntry.objects.create(
            title="My Entry", created_by=self.user
        )
        assert str(entry) == "My Entry"

    def test_full_create(self) -> None:
        """Creating an entry with all fields works."""
        entry = DirectoryEntry.objects.create(
            title="Full Entry",
            description="A description.",
            extra={"website": "https://example.com"},
            created_by=self.user,
        )
        assert entry.title == "Full Entry"
        assert entry.description == "A description."
        assert entry.extra == {"website": "https://example.com"}
        assert entry.created_by == self.user
        assert entry.created_at is not None
        assert entry.updated_at is not None
