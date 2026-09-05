from __future__ import annotations

from functools import wraps
from typing import TYPE_CHECKING, Any

from django_ratelimit.core import get_usage
from django_ratelimit.decorators import ratelimit as _django_ratelimit
from django_ratelimit.exceptions import Ratelimited
from ninja.errors import HttpError

if TYPE_CHECKING:
    from collections.abc import Callable

    from django.http import HttpRequest, HttpResponse


def client_ip(request: HttpRequest) -> str:
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META["REMOTE_ADDR"]


def _format_time_left(seconds: int) -> str:
    """Format a wait as e.g. '45 seconds' or '9 minutes and 30 seconds'."""
    minutes, seconds = divmod(seconds, 60)
    parts: list[str] = []
    if minutes:
        parts.append(f"{minutes} minute{'s' if minutes != 1 else ''}")
    if seconds or not parts:
        parts.append(f"{seconds} second{'s' if seconds != 1 else ''}")
    return " and ".join(parts)


def ratelimit(*, key: str, rate: str, block: bool = True) -> Callable[..., Any]:
    """
    django-ratelimit's @ratelimit decorator, unchanged in behaviour, except
    that being rate limited raises a 429 HttpError whose message reports the
    exact time left until the rate-limit window resets.
    """

    def decorator(fn: Callable[..., Any]) -> Callable[..., Any]:
        limited_fn = _django_ratelimit(key=key, rate=rate, block=block)(fn)

        @wraps(fn)
        def wrapped(request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
            try:
                return limited_fn(request, *args, **kwargs)

            except Ratelimited:
                # Re-read the limiter (without incrementing it) to get the
                # exact time left on the current window.
                usage = get_usage(request, fn=fn, key=key, rate=rate, increment=False)
                wait = usage["time_left"] if usage else 0

                if wait > 0:
                    message = (
                        "Too many requests. Please try again in "
                        f"{_format_time_left(wait)}."
                    )
                else:
                    message = "Too many requests. Please try again shortly."

                raise HttpError(429, message) from None

        return wrapped

    return decorator
