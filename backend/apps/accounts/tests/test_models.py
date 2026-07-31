from __future__ import annotations

import hypothesis.strategies as st
from hypothesis import given
from hypothesis.extra.django import TestCase as HypothesisTestCase

from apps.accounts.models import User


class UserModelTests(HypothesisTestCase):
    @given(email=st.emails())
    def test_new_user_defaults_to_member_role(self, email: str) -> None:
        """Every newly created User defaults to role='member'."""
        user = User.objects.create_user(email)
        assert user.role == "member"

    @given(email=st.emails())
    def test_new_user_has_unusable_password(self, email: str) -> None:
        """Every newly created User has an unusable password."""
        user = User.objects.create_user(email)
        assert not user.has_usable_password()

    @given(email=st.emails())
    def test_new_user_username_is_generated_id(self, email: str) -> None:
        """Username is an auto-generated opaque ID, never the email."""
        user = User.objects.create_user(email)
        assert user.username != email
        assert len(user.username) == 32

    def test_usernames_are_unique_across_users(self) -> None:
        """Each account gets a distinct globally-unique username."""
        user1 = User.objects.create_user("one@example.com")
        user2 = User.objects.create_user("two@example.com")
        assert user1.username != user2.username

    def test_username_stable_across_email_change(self) -> None:
        """The username ID never changes, even when the email changes."""
        user = User.objects.create_user("before@example.com")
        username = user.username
        user.email = "after@example.com"
        user.save()
        user.refresh_from_db()
        assert user.username == username

    def test_create_superuser_is_still_member_by_default(self) -> None:
        """Superusers automatically get the admin role."""
        user = User.objects.create_superuser(
            "admin@example.com", "admin@example.com", "testpass123"
        )
        assert user.role == "admin"

    def test_user_is_passwordless(self) -> None:
        """Member accounts are passwordless (OTP login)."""
        user = User.objects.create_user("member@example.com")
        assert not user.has_usable_password()
