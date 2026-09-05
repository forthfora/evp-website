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
        user1 = User.objects.create_user("delivered+one@resend.dev")
        user2 = User.objects.create_user("delivered+two@resend.dev")
        assert user1.username != user2.username

    def test_username_stable_across_email_change(self) -> None:
        """The username ID never changes, even when the email changes."""
        user = User.objects.create_user("delivered+before@resend.dev")
        username = user.username
        user.email = "delivered+after@resend.dev"
        user.save()
        user.refresh_from_db()
        assert user.username == username

    def test_create_superuser_is_still_member_by_default(self) -> None:
        """Superusers automatically get the admin role."""
        user = User.objects.create_superuser(
            "delivered+admin@resend.dev", "delivered+admin@resend.dev", "testpass123"
        )
        assert user.role == "admin"

    def test_user_is_passwordless(self) -> None:
        """Member accounts are passwordless (OTP login)."""
        user = User.objects.create_user("delivered+member@resend.dev")
        assert not user.has_usable_password()

    def test_create_user_normalizes_email(self) -> None:
        """Emails are stored in canonical (lowercase, trimmed) form so
        SQLite and MySQL agree on uniqueness."""
        user = User.objects.create_user("  Delivered+Case@Resend.dev ")
        assert user.email == "delivered+case@resend.dev"
