from __future__ import annotations

import hypothesis.strategies as st
from hypothesis import given
from hypothesis.extra.django import TestCase as HypothesisTestCase

from apps.accounts.models import User


class UserModelTests(HypothesisTestCase):
    @given(email=st.emails())
    def test_new_user_defaults_to_member_role(self, email: str) -> None:
        """Every newly created User defaults to role='member'."""
        user = User.objects.create_user(email=email)
        self.assertEqual(user.role, "member")

    @given(email=st.emails())
    def test_new_user_has_unusable_password(self, email: str) -> None:
        """Every newly created User has an unusable password."""
        user = User.objects.create_user(email=email)
        self.assertFalse(user.has_usable_password())

    @given(email=st.emails())
    def test_new_user_username_defaults_to_email(self, email: str) -> None:
        """Username defaults to email when not explicitly provided."""
        user = User.objects.create_user(email=email)
        self.assertEqual(user.username, email)

    def test_create_superuser_is_still_member_by_default(self) -> None:
        """Superusers also get role='member' unless explicitly set otherwise."""
        user = User.objects.create_superuser(
            email="admin@example.com", password="testpass123"
        )
        self.assertEqual(user.role, "member")
