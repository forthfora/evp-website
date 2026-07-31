from django.conf import settings
from django.http import Http404, HttpRequest, HttpResponse
from ninja import NinjaAPI
from ninja.errors import AuthorizationError, HttpError, ValidationError

from helpers.exceptions import ResourceNotFound

api = NinjaAPI(
    title="EVP API",
    version="1.0.0",
    description="Backend API for managing user access",
    docs_url="docs" if settings.DEBUG else None,
)


# pydantic validation error handler (request-schema mismatch)
@api.exception_handler(ValidationError)
def validation_error_handler(
    request: HttpRequest, exc: ValidationError
) -> HttpResponse:
    errors: dict[str, list[str]] = {}

    for error in exc.errors:
        # extract field name from loc (if loc exists)
        loc = error.get("loc", [])
        field = str(loc[-1]) if loc else "unknown"

        msg = error.get("msg", "")

        # strip unnecessary prefixes
        for prefix in ("Value error, ", "Assertion failed, "):
            if msg.startswith(prefix):
                msg = msg[len(prefix) :]

        errors.setdefault(field, []).append(msg)

    # HTTP 422 (Unprocessable Entity)
    return api.create_response(request, {"errors": errors}, status=422)


def _resource_from_path(path: str) -> str:
    # TODO: add more specific cases
    return "resource"


@api.exception_handler(Http404)
def not_found_handler(request: HttpRequest, exc: Http404) -> HttpResponse:
    resource = (
        exc.resource
        if isinstance(exc, ResourceNotFound)
        else _resource_from_path(request.path)
    )
    return api.create_response(
        request, {"errors": {resource: ["not found"]}}, status=404
    )


@api.exception_handler(AuthorizationError)
def authorization_error_handler(
    request: HttpRequest, exc: AuthorizationError
) -> HttpResponse:
    return api.create_response(
        request,
        {"errors": {_resource_from_path(request.path): ["forbidden"]}},
        status=403,
    )


@api.exception_handler(HttpError)
def http_error_handler(request: HttpRequest, exc: HttpError) -> HttpResponse:
    if exc.status_code == 401:
        return api.create_response(
            request, {"errors": {"token": ["is missing"]}}, status=401
        )
    return api.create_response(request, {"detail": str(exc)}, status=exc.status_code)


api.add_router("", "apps.core.api.router")
api.add_router("/account/", "apps.accounts.api.router")
api.add_router("/startupdb/", "apps.startupdb.api.router")
api.add_router("/updates/", "apps.updates.api.router")
