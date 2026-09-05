from django.conf import settings
from django.test import TestCase


class CacheSettingsTests(TestCase):
    """Tests for the CACHES configuration in config/settings.py."""

    def test_cache_backend_matches_cache_url(self) -> None:
        """The default cache follows CACHE_URL: Redis (shared across
        Gunicorn workers) when set, per-process LocMemCache otherwise.

        The assertion is environment-independent so the test passes whether
        or not the local `.env` enables Redis.
        """
        if settings.CACHE_URL:
            assert settings.CACHES["default"]["BACKEND"] == (
                "django.core.cache.backends.redis.RedisCache"
            )
            assert settings.CACHES["default"]["LOCATION"] == settings.CACHE_URL
        else:
            assert settings.CACHES["default"]["BACKEND"] == (
                "django.core.cache.backends.locmem.LocMemCache"
            )

    def test_redis_cache_backend_is_available(self) -> None:
        """The Redis cache backend (used when CACHE_URL is set) imports cleanly
        and the redis client is installed."""
        import redis  # noqa: F401
        from django.core.cache.backends.redis import RedisCache  # noqa: F401
