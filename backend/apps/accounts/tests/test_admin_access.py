from __future__ import annotations

from django.test import TestCase
from django.urls import reverse

from apps.accounts.models import User


class AdminAccessTests(TestCase):
    def setUp(self) -> None:
        self.index_url = reverse("admin:index")
        self.login_url = reverse("admin:login")
        self.superuser = User.objects.create_superuser(
            "boss@example.com",
            "Boss",
            "Admin",
            password="s3cret!",  # type: ignore
        )
        self.staff = User.objects.create_user("staff@example.com", is_staff=True)

    def test_superuser_can_access_admin_index(self) -> None:
        """A logged-in superuser can open the admin panel."""
        self.client.force_login(self.superuser)
        resp = self.client.get(self.index_url)
        assert resp.status_code == 200

    def test_staff_non_superuser_cannot_access_admin(self) -> None:
        """Staff members who are not superusers are sent to the admin login."""
        self.client.force_login(self.staff)
        resp = self.client.get(self.index_url)
        assert resp.status_code == 302
        assert self.login_url in resp.url  # type: ignore
        # Even after following the redirect they are not admitted.
        assert self.client.get(self.index_url, follow=True).status_code == 200
        assert "Log in" in self.client.get(self.login_url).content.decode()

    def test_anonymous_user_is_redirected_to_login(self) -> None:
        """Anonymous visitors are sent to the admin login page."""
        resp = self.client.get(self.index_url)
        assert resp.status_code == 302
        assert self.login_url in resp.url  # type: ignore

    def test_superuser_logs_in_with_password_via_admin_form(self) -> None:
        """Superusers with a password can use the standard admin login."""
        resp = self.client.post(
            self.login_url,
            {
                "username": "boss@example.com",
                "password": "s3cret!",
                "next": self.index_url,
            },
        )
        assert resp.status_code == 302
        assert self.client.get(self.index_url).status_code == 200

    def test_wrong_password_is_rejected(self) -> None:
        """An invalid password keeps the login form on screen."""
        resp = self.client.post(
            self.login_url,
            {
                "username": "boss@example.com",
                "password": "wrong",
                "next": self.index_url,
            },
        )
        assert resp.status_code == 200
        assert self.client.get(self.index_url).status_code == 302
