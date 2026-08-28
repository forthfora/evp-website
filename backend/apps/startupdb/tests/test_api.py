import hypothesis.strategies as st
from django.test import TestCase
from hypothesis import given, settings
from hypothesis.extra.django import TestCase as HypothesisTestCase

from apps.accounts.models import Role, User
from apps.core.permissions import can_manage_entry
from apps.startupdb.models import Founder, Occupation, StartupEntry


class StartupAPITests(TestCase):
    """Tests for the startup entry API endpoints."""

    def setUp(self) -> None:
        self.list_url = "/api/startupdb/"
        self.founders_url = "/api/startupdb/founders"

        self.member = User.objects.create_user("delivered+member@resend.dev")

        self.scout1 = User.objects.create_user(
            "delivered+scout1@resend.dev", role=Role.SCOUT
        )
        self.scout2 = User.objects.create_user(
            "delivered+scout2@resend.dev", role=Role.SCOUT
        )
        self.committee = User.objects.create_user(
            "delivered+committee@resend.dev", role=Role.COMMITTEE
        )
        self.admin = User.objects.create_user(
            "delivered+admin@resend.dev", role=Role.ADMIN
        )

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

    def _login(self, user: User) -> None:
        self.client.force_login(user)

    def _entry_url(self, entry: StartupEntry) -> str:
        return f"/api/startupdb/{entry.id}"

    def test_list_allowed_for_scout(self) -> None:
        self._login(self.scout1)
        resp = self.client.get(self.list_url)
        assert resp.status_code == 200

    def test_list_allowed_for_committee(self) -> None:
        self._login(self.committee)
        resp = self.client.get(self.list_url)
        assert resp.status_code == 200

    def test_list_allowed_for_admin(self) -> None:
        self._login(self.admin)
        resp = self.client.get(self.list_url)
        assert resp.status_code == 200

    def test_list_denied_for_member(self) -> None:
        self._login(self.member)
        resp = self.client.get(self.list_url)
        assert resp.status_code == 403

    def test_list_requires_auth(self) -> None:
        resp = self.client.get(self.list_url)
        assert resp.status_code == 401

    def test_create_allowed_for_scout(self) -> None:
        self._login(self.scout1)
        resp = self.client.post(
            self.list_url,
            {"name": "New Entry", "description": "By scout 1"},
            content_type="application/json",
        )
        assert resp.status_code == 201

    def test_create_allowed_for_committee(self) -> None:
        self._login(self.committee)
        resp = self.client.post(
            self.list_url,
            {"name": "New Entry", "description": "By committee"},
            content_type="application/json",
        )
        assert resp.status_code == 201

    def test_create_allowed_for_admin(self) -> None:
        self._login(self.admin)
        resp = self.client.post(
            self.list_url,
            {"name": "New Entry", "description": "By admin"},
            content_type="application/json",
        )
        assert resp.status_code == 201

    def test_create_denied_for_member(self) -> None:
        self._login(self.member)
        resp = self.client.post(
            self.list_url,
            {"name": "New Entry"},
            content_type="application/json",
        )
        assert resp.status_code == 403

    def test_create_sets_created_by_server_side(self) -> None:
        """created_by is always set from the authenticated user, not the body."""
        self._login(self.scout1)
        resp = self.client.post(
            self.list_url,
            {"name": "Server-Side", "description": "Test"},
            content_type="application/json",
        )
        assert resp.status_code == 201
        entry = StartupEntry.objects.get(name="Server-Side")
        assert entry.created_by == self.scout1

    def test_update_own_entry_as_scout(self) -> None:
        self._login(self.scout1)
        resp = self.client.patch(
            self._entry_url(self.scout1_entry),
            {"name": "Updated by owner"},
            content_type="application/json",
        )
        assert resp.status_code == 200

    def test_update_own_entry_as_committee(self) -> None:
        self._login(self.committee)
        resp = self.client.patch(
            self._entry_url(self.committee_entry),
            {"name": "Updated by committee"},
            content_type="application/json",
        )
        assert resp.status_code == 200

    def test_update_any_entry_as_admin(self) -> None:
        self._login(self.admin)
        for entry in (self.scout1_entry, self.committee_entry, self.admin_entry):
            resp = self.client.patch(
                self._entry_url(entry),
                {"name": f"Updated by admin {entry.id}"},
                content_type="application/json",
            )
            assert resp.status_code == 200

    def test_update_other_entry_as_scout_denied(self) -> None:
        self._login(self.scout1)
        resp = self.client.patch(
            self._entry_url(self.scout2_entry),
            {"name": "Hacked"},
            content_type="application/json",
        )
        assert resp.status_code == 403

    def test_delete_own_entry_as_scout(self) -> None:
        self._login(self.scout1)
        resp = self.client.delete(self._entry_url(self.scout1_entry))
        assert resp.status_code == 204

    def test_delete_any_entry_as_admin(self) -> None:
        self._login(self.admin)
        for entry in (self.scout1_entry, self.committee_entry, self.admin_entry):
            resp = self.client.delete(self._entry_url(entry))
            assert resp.status_code == 204

    def test_delete_scout_entry_as_committee_denied(self) -> None:
        self._login(self.committee)
        resp = self.client.delete(self._entry_url(self.scout1_entry))
        assert resp.status_code == 403

    def test_delete_other_entry_as_scout_denied(self) -> None:
        self._login(self.scout1)
        resp = self.client.delete(self._entry_url(self.scout2_entry))
        assert resp.status_code == 403

    def test_create_with_all_fields(self) -> None:
        """Create with all optional fields works."""
        self._login(self.scout1)
        resp = self.client.post(
            self.list_url,
            {
                "name": "Full Entry",
                "description": "A desc",
                "website": "https://example.com",
                "linkedin": "https://linkedin.com/company/test",
                "email": "delivered+test@resend.dev",
                "location": "Edinburgh",
                "notes": "Some notes",
                "founding_date": "2024-01-15",
            },
            content_type="application/json",
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["name"] == "Full Entry"
        assert data["website"] == "https://example.com"
        assert data["linkedin"] == "https://linkedin.com/company/test"
        assert data["email"] == "delivered+test@resend.dev"
        assert data["location"] == "Edinburgh"
        assert data["notes"] == "Some notes"
        assert data["founding_date"] == "2024-01-15"


class FounderAPITests(TestCase):
    """Tests for the founder API endpoints."""

    def setUp(self) -> None:
        self.founders_url = "/api/startupdb/founders"

        self.member = User.objects.create_user("delivered+member@resend.dev")

        self.scout1 = User.objects.create_user(
            "delivered+scout1@resend.dev", role=Role.SCOUT
        )
        self.scout2 = User.objects.create_user(
            "delivered+scout2@resend.dev", role=Role.SCOUT
        )
        self.committee = User.objects.create_user(
            "delivered+committee@resend.dev", role=Role.COMMITTEE
        )
        self.admin = User.objects.create_user(
            "delivered+admin@resend.dev", role=Role.ADMIN
        )

        self.scout1_founder = Founder.objects.create(
            first_name="Jane",
            last_name="Owner",
            occupation=Occupation.PHD,
            created_by=self.scout1,
        )
        self.scout2_founder = Founder.objects.create(
            first_name="Other",
            last_name="Scout",
            occupation=Occupation.MASTERS,
            created_by=self.scout2,
        )
        self.committee_founder = Founder.objects.create(
            first_name="Committee",
            last_name="Member",
            occupation=Occupation.BACHELORS,
            created_by=self.committee,
        )
        self.admin_founder = Founder.objects.create(
            first_name="Admin",
            last_name="User",
            occupation=Occupation.GRADUATED,
            created_by=self.admin,
        )

    def _login(self, user: User) -> None:
        self.client.force_login(user)

    def _founder_url(self, founder: Founder) -> str:
        return f"{self.founders_url}/{founder.id}"

    def test_list_allowed_for_scout(self) -> None:
        self._login(self.scout1)
        resp = self.client.get(self.founders_url)
        assert resp.status_code == 200

    def test_list_allowed_for_committee(self) -> None:
        self._login(self.committee)
        resp = self.client.get(self.founders_url)
        assert resp.status_code == 200

    def test_list_allowed_for_admin(self) -> None:
        self._login(self.admin)
        resp = self.client.get(self.founders_url)
        assert resp.status_code == 200

    def test_list_denied_for_member(self) -> None:
        self._login(self.member)
        resp = self.client.get(self.founders_url)
        assert resp.status_code == 403

    def test_list_requires_auth(self) -> None:
        resp = self.client.get(self.founders_url)
        assert resp.status_code == 401

    def test_create_allowed_for_scout(self) -> None:
        self._login(self.scout1)
        resp = self.client.post(
            self.founders_url,
            {
                "first_name": "New",
                "last_name": "ScoutFounder",
                "occupation": "phd",
            },
            content_type="application/json",
        )
        assert resp.status_code == 201

    def test_create_allowed_for_committee(self) -> None:
        self._login(self.committee)
        resp = self.client.post(
            self.founders_url,
            {
                "first_name": "New",
                "last_name": "CommitteeFounder",
                "occupation": "masters",
            },
            content_type="application/json",
        )
        assert resp.status_code == 201

    def test_create_allowed_for_admin(self) -> None:
        self._login(self.admin)
        resp = self.client.post(
            self.founders_url,
            {
                "first_name": "New",
                "last_name": "AdminFounder",
                "occupation": "graduated",
            },
            content_type="application/json",
        )
        assert resp.status_code == 201

    def test_create_denied_for_member(self) -> None:
        self._login(self.member)
        resp = self.client.post(
            self.founders_url,
            {
                "first_name": "New",
                "last_name": "MemberFounder",
                "occupation": "bachelors",
            },
            content_type="application/json",
        )
        assert resp.status_code == 403

    def test_create_sets_created_by_server_side(self) -> None:
        self._login(self.scout1)
        resp = self.client.post(
            self.founders_url,
            {
                "first_name": "Server",
                "last_name": "Side",
                "occupation": "phd",
            },
            content_type="application/json",
        )
        assert resp.status_code == 201
        founder = Founder.objects.get(first_name="Server", last_name="Side")
        assert founder.created_by == self.scout1

    def test_update_own_founder_as_scout(self) -> None:
        self._login(self.scout1)
        resp = self.client.patch(
            self._founder_url(self.scout1_founder),
            {"location": "Updated location"},
            content_type="application/json",
        )
        assert resp.status_code == 200
        assert resp.json()["location"] == "Updated location"

    def test_update_own_founder_as_committee(self) -> None:
        self._login(self.committee)
        resp = self.client.patch(
            self._founder_url(self.committee_founder),
            {"location": "Committee location"},
            content_type="application/json",
        )
        assert resp.status_code == 200

    def test_update_any_founder_as_admin(self) -> None:
        self._login(self.admin)
        for founder in (self.scout1_founder, self.committee_founder):
            resp = self.client.patch(
                self._founder_url(founder),
                {"notes": "Updated by admin"},
                content_type="application/json",
            )
            assert resp.status_code == 200

    def test_update_other_founder_as_scout_denied(self) -> None:
        self._login(self.scout1)
        resp = self.client.patch(
            self._founder_url(self.scout2_founder),
            {"notes": "Hacked"},
            content_type="application/json",
        )
        assert resp.status_code == 403

    def test_delete_own_founder_as_scout(self) -> None:
        self._login(self.scout1)
        resp = self.client.delete(self._founder_url(self.scout1_founder))
        assert resp.status_code == 204

    def test_delete_any_founder_as_admin(self) -> None:
        self._login(self.admin)
        resp = self.client.delete(self._founder_url(self.scout1_founder))
        assert resp.status_code == 204

    def test_delete_scout_founder_as_committee_denied(self) -> None:
        self._login(self.committee)
        resp = self.client.delete(self._founder_url(self.scout1_founder))
        assert resp.status_code == 403

    def test_delete_other_founder_as_scout_denied(self) -> None:
        self._login(self.scout1)
        resp = self.client.delete(self._founder_url(self.scout2_founder))
        assert resp.status_code == 403


class FounderPermissionsPropertyTests(HypothesisTestCase):
    """Hypothesis property test over (role, is_owner) for founder ownership."""

    @settings(deadline=None, max_examples=30)
    @given(
        role=st.sampled_from([r.value for r in Role]),
        is_owner=st.booleans(),
    )
    def test_can_manage_entry_matrix(self, role: str, is_owner: bool) -> None:
        user = User.objects.create_user(f"delivered+{role}@resend.dev", role=role)

        founder = Founder()
        founder.created_by = (
            user if is_owner else User.objects.create_user("delivered+other@resend.dev")
        )

        result = can_manage_entry(user, founder)

        expected = role == Role.ADMIN or (
            role in (Role.COMMITTEE, Role.SCOUT) and is_owner
        )
        assert result is expected
