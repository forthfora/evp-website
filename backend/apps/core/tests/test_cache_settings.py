from django.conf import settings
from django.test import TestCase


class CacheSettingsTests(TestCase):
    """Tests for the CACHES configuration in config/settings.py."""

    def test_cache_falls_back_to_locmem_without_cache_url(self) -> None:
        """Without CACHE_URL (local dev / test runner) the default cache is
        per-process LocMemCache — the documented single-process fallback.

        Production sets CACHE_URL (see docker-compose*.yml), which switches the
        default cache to Django's built-in RedisCache so django-ratelimit
        counts are shared across all Gunicorn workers.
        """
        assert settings.CACHES["default"]["BACKEND"] == (
            "django.core.cache.backends.locmem.LocMemCache"
        )

    def test_redis_cache_backend_is_available(self) -> None:
        """The Redis cache backend (used when CACHE_URL is set) imports cleanly
        and the redis client is installed."""
        import redis  # noqa: F401
        from django.core.cache.backends.redis import RedisCache  # noqa: F401
