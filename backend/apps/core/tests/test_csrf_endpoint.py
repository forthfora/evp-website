from django.test import Client, TestCase


class CsrfEndpointTests(TestCase):
    def test_csrf_endpoint_returns_token(self) -> None:
        """GET /api/csrf returns a non-empty CSRF token in the JSON body."""
        client = Client()
        response = client.get("/api/csrf")

        assert response.status_code == 200
        data = response.json()
        assert "csrftoken" in data
        assert isinstance(data["csrftoken"], str)
        assert len(data["csrftoken"]) > 0
