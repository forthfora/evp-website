from django.test import RequestFactory, TestCase

from apps.core.ratelimit import client_ip


class ClientIpTests(TestCase):
    """Tests for the client_ip resolver used by django-ratelimit."""

    def setUp(self) -> None:
        self.factory = RequestFactory()

    def test_uses_x_forwarded_for_when_present(self) -> None:
        """The nginx-controlled X-Forwarded-For value is used directly."""
        request = self.factory.get("/", HTTP_X_FORWARDED_FOR="203.0.113.7")
        assert client_ip(request) == "203.0.113.7"

    def test_takes_first_value_of_a_list(self) -> None:
        """If a chain ever appends, the leftmost (client) value is used."""
        request = self.factory.get("/", HTTP_X_FORWARDED_FOR="203.0.113.7, 10.0.0.1")
        assert client_ip(request) == "203.0.113.7"

    def test_falls_back_to_remote_addr_without_header(self) -> None:
        """No X-Forwarded-For (test client / direct access) → REMOTE_ADDR."""
        request = self.factory.get("/", REMOTE_ADDR="198.51.100.9")
        assert client_ip(request) == "198.51.100.9"
