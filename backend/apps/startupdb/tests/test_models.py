from __future__ import annotations

import pytest
from django.db import IntegrityError
from django.test import TestCase

from apps.accounts.models import User
from apps.startupdb.models import StartupEntry


class StartupEntryModelTests(TestCase):
    """Tests for the StartupEntry model."""

    def setUp(self) -> None:
        self.user = User.objects.create_user("entry-owner@test.com")

    def test_description_defaults_to_blank(self) -> None:
        """description field is blank by default."""
        entry = StartupEntry.objects.create(name="Test Entry", created_by=self.user)
        assert entry.description == ""

    def test_created_by_is_required(self) -> None:
        """Creating an entry without created_by raises IntegrityError."""
        with pytest.raises(IntegrityError):
            StartupEntry.objects.create(name="Orphan Entry")

    def test_str_returns_name(self) -> None:
        """__str__ returns the entry name."""
        entry = StartupEntry.objects.create(name="My Entry", created_by=self.user)
        assert str(entry) == "My Entry"

    def test_full_create(self) -> None:
        """Creating an entry with all fields works."""
        entry = StartupEntry.objects.create(
            name="Full Startup Entry",
            description="A description.",
            website="https://www.example.com/",
            email="test@example.com",
            created_by=self.user,
        )
        assert entry.name == "Full Startup Entry"
        assert entry.description == "A description."

        assert entry.website == "https://www.example.com/"
        assert entry.email == "test@example.com"

        assert entry.created_by == self.user
        assert entry.created_at is not None
        assert entry.updated_at is not None
