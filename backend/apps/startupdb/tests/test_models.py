from __future__ import annotations

import pytest
from django.db import IntegrityError
from django.test import TestCase

from apps.accounts.models import User
from apps.startupdb.models import Founder, Occupation, StartupEntry


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

    def test_name_uniqueness(self) -> None:
        """Duplicate entry names raise IntegrityError."""
        StartupEntry.objects.create(name="Unique Name", created_by=self.user)
        with pytest.raises(IntegrityError):
            StartupEntry.objects.create(name="Unique Name", created_by=self.user)

    def test_full_create(self) -> None:
        """Creating an entry with all fields works."""
        founder = Founder.objects.create(
            first_name="Ada",
            last_name="Lovelace",
            occupation=Occupation.PHD,
            created_by=self.user,
        )
        entry = StartupEntry.objects.create(
            name="Full Startup Entry",
            description="A description.",
            website="https://www.example.com/",
            linkedin="https://linkedin.com/company/test",
            email="test@example.com",
            location="Edinburgh",
            notes="Some notes",
            founding_date="2024-01-15",
            created_by=self.user,
        )
        entry.founders.add(founder)

        assert entry.name == "Full Startup Entry"
        assert entry.description == "A description."
        assert entry.website == "https://www.example.com/"
        assert entry.linkedin == "https://linkedin.com/company/test"
        assert entry.email == "test@example.com"
        assert entry.location == "Edinburgh"
        assert entry.notes == "Some notes"
        assert str(entry.founding_date) == "2024-01-15"
        assert list(entry.founders.all()) == [founder]
        assert entry.created_by == self.user
        assert entry.created_at is not None
        assert entry.updated_at is not None

    def test_multiple_founders(self) -> None:
        """A startup can have multiple founders."""
        founder_a = Founder.objects.create(
            first_name="Alan",
            last_name="Turing",
            occupation=Occupation.PHD,
            created_by=self.user,
        )
        founder_b = Founder.objects.create(
            first_name="Grace",
            last_name="Hopper",
            occupation=Occupation.PHD,
            created_by=self.user,
        )
        entry = StartupEntry.objects.create(
            name="Multi-Founder Startup", created_by=self.user
        )
        entry.founders.add(founder_a, founder_b)
        assert list(entry.founders.all().order_by("pk")) == [founder_a, founder_b]

    def test_new_fields_default_to_blank(self) -> None:
        """New optional fields default to empty/None."""
        entry = StartupEntry.objects.create(name="Defaults Test", created_by=self.user)
        assert entry.website == ""
        assert entry.linkedin == ""
        assert entry.email == ""
        assert entry.location == ""
        assert entry.notes == ""
        assert entry.founding_date is None


class FounderModelTests(TestCase):
    """Tests for the Founder model."""

    def setUp(self) -> None:
        self.user = User.objects.create_user("founder-creator@test.com")

    def test_str_returns_full_name(self) -> None:
        """__str__ returns 'First Last'."""
        founder = Founder.objects.create(
            first_name="Ada",
            last_name="Lovelace",
            occupation=Occupation.PHD,
            created_by=self.user,
        )
        assert str(founder) == "Ada Lovelace"

    def test_created_by_is_required(self) -> None:
        """Creating a founder without created_by raises IntegrityError."""
        with pytest.raises(IntegrityError):
            Founder.objects.create(
                first_name="No",
                last_name="Owner",
                occupation=Occupation.GRADUATED,
            )

    def test_composite_name_uniqueness(self) -> None:
        """Duplicate (first_name, last_name) raises IntegrityError."""
        Founder.objects.create(
            first_name="John",
            last_name="Doe",
            occupation=Occupation.BACHELORS,
            created_by=self.user,
        )
        with pytest.raises(IntegrityError):
            Founder.objects.create(
                first_name="John",
                last_name="Doe",
                occupation=Occupation.MASTERS,
                created_by=self.user,
            )

    def test_same_name_different_last_allowed(self) -> None:
        """Same first name + different last name is allowed."""
        Founder.objects.create(
            first_name="John",
            last_name="Doe",
            occupation=Occupation.BACHELORS,
            created_by=self.user,
        )
        Founder.objects.create(
            first_name="John",
            last_name="Smith",
            occupation=Occupation.MASTERS,
            created_by=self.user,
        )

    def test_valid_occupation_choices(self) -> None:
        """All occupation choices can be set and stored."""
        for choice in Occupation:
            founder = Founder.objects.create(
                first_name="Test",
                last_name=f"{choice.value}",
                occupation=choice,
                created_by=self.user,
            )
            founder.refresh_from_db()
            assert founder.occupation == choice.value

    def test_optional_fields_default_to_blank(self) -> None:
        """location, linkedin, email, notes default to empty string."""
        founder = Founder.objects.create(
            first_name="Grace",
            last_name="Hopper",
            occupation=Occupation.PHD,
            created_by=self.user,
        )
        assert founder.location == ""
        assert founder.linkedin == ""
        assert founder.email == ""
        assert founder.notes == ""

    def test_founder_can_link_multiple_startups(self) -> None:
        """A founder can be linked to multiple startups."""
        founder = Founder.objects.create(
            first_name="Multi",
            last_name="Founder",
            occupation=Occupation.GRADUATED,
            created_by=self.user,
        )
        s1 = StartupEntry.objects.create(name="Startup A", created_by=self.user)
        s2 = StartupEntry.objects.create(name="Startup B", created_by=self.user)
        s1.founders.add(founder)
        s2.founders.add(founder)
        assert list(founder.startups.all().order_by("name")) == [s1, s2]
