from __future__ import annotations

from datetime import datetime  # noqa: TC003

from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404
from ninja import Router, Schema

from apps.core.permissions import can_manage_startup, require_role
from apps.startupdb.models import StartupEntry

router = Router(tags=["StartupDB"])


class EntryOut(Schema):
    id: int
    name: str
    description: str

    created_by_id: int
    created_at: datetime
    updated_at: datetime


class EntryIn(Schema):
    name: str
    description: str = ""


class EntryPatchIn(Schema):
    name: str | None = None
    description: str | None = None


@router.get(
    "/startupdb",
    response=list[EntryOut],
    auth=require_role("scout", "committee", "admin"),
    summary="List all startup entries",
)
def list_entries(request: HttpRequest) -> list[StartupEntry]:
    """Return all startup entries (scout/committee/admin only)."""
    return list(StartupEntry.objects.all())


@router.post(
    "/startupdb",
    response=EntryOut,
    auth=require_role("scout", "committee", "admin"),
    summary="Create a startup entry",
)
def create_entry(request: HttpRequest, payload: EntryIn) -> StartupEntry:
    """Create a new startup entry (scout/committee/admin only).

    ``created_by`` is always set from the authenticated user — the request
    body must not contain it (T15.3).
    """
    user = request.auth.user  # type: ignore[union-attr]
    return StartupEntry.objects.create(
        name=payload.name,
        description=payload.description,
        created_by=user,
    )


@router.patch(
    "/startupdb/{entry_id}",
    response=EntryOut,
    auth=require_role("scout", "committee", "admin"),
    summary="Update a startup entry (owner or admin)",
)
def update_entry(
    request: HttpRequest,
    entry_id: int,
    payload: EntryPatchIn,
) -> StartupEntry:
    """Update a startup entry.  Scouts may only update their own entries;
    committee may update any entry.
    """
    entry = get_object_or_404(StartupEntry, id=entry_id)
    user = request.auth.user  # type: ignore[union-attr]

    if not can_manage_startup(user, entry):
        from ninja.errors import HttpError

        raise HttpError(403, "Forbidden")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(entry, field, value)
    entry.save()
    return entry


@router.delete(
    "/startupdb/{entry_id}",
    response={204: None},
    auth=require_role("scout", "committee", "admin"),
    summary="Delete a startup entry (owner or admin)",
)
def delete_entry(
    request: HttpRequest,
    entry_id: int,
) -> HttpResponse:
    """Delete a startup entry.  Scouts/committee may only delete their own entries;
    admin may delete any entry.
    """
    entry = get_object_or_404(StartupEntry, id=entry_id)
    user = request.auth.user  # type: ignore[union-attr]

    if not can_manage_startup(user, entry):
        from ninja.errors import HttpError

        raise HttpError(403, "Forbidden")

    entry.delete()
    return HttpResponse(status=204)
