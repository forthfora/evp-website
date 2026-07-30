from __future__ import annotations

from datetime import datetime  # noqa: TC003

from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404
from ninja import Router, Schema

from apps.core.permissions import is_owner_or_committee, require_role
from apps.directory.models import DirectoryEntry

router = Router(tags=["Directory"])


class EntryOut(Schema):
    id: int
    title: str
    description: str
    extra: dict
    created_by_id: int
    created_at: datetime
    updated_at: datetime


class EntryIn(Schema):
    title: str
    description: str = ""


class EntryPatchIn(Schema):
    title: str | None = None
    description: str | None = None
    extra: dict | None = None


@router.get(
    "/entries",
    response=list[EntryOut],
    auth=require_role("scout", "committee"),
    summary="List all directory entries",
)
def list_entries(request: HttpRequest) -> list[DirectoryEntry]:
    """Return all directory entries (scout/committee only)."""
    return list(DirectoryEntry.objects.all())


@router.post(
    "/entries",
    response=EntryOut,
    auth=require_role("scout", "committee"),
    summary="Create a directory entry",
)
def create_entry(request: HttpRequest, payload: EntryIn) -> DirectoryEntry:
    """Create a new directory entry (scout/committee only).

    ``created_by`` is always set from the authenticated user — the request
    body must not contain it (T15.3).
    """
    user = request.auth.user  # type: ignore[union-attr]
    return DirectoryEntry.objects.create(
        title=payload.title,
        description=payload.description,
        created_by=user,
    )


@router.patch(
    "/entries/{entry_id}",
    response=EntryOut,
    auth=require_role("scout", "committee"),
    summary="Update a directory entry (owner or committee)",
)
def update_entry(
    request: HttpRequest,
    entry_id: int,
    payload: EntryPatchIn,
) -> DirectoryEntry:
    """Update a directory entry.  Scouts may only update their own entries;
    committee may update any entry.
    """
    entry = get_object_or_404(DirectoryEntry, id=entry_id)
    user = request.auth.user  # type: ignore[union-attr]

    if not is_owner_or_committee(user, entry):
        from ninja.errors import HttpError

        raise HttpError(403, "Forbidden")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(entry, field, value)
    entry.save()
    return entry


@router.delete(
    "/entries/{entry_id}",
    response={204: None},
    auth=require_role("scout", "committee"),
    summary="Delete a directory entry (owner or committee)",
)
def delete_entry(
    request: HttpRequest,
    entry_id: int,
) -> HttpResponse:
    """Delete a directory entry.  Scouts may only delete their own entries;
    committee may delete any entry.
    """
    entry = get_object_or_404(DirectoryEntry, id=entry_id)
    user = request.auth.user  # type: ignore[union-attr]

    if not is_owner_or_committee(user, entry):
        from ninja.errors import HttpError

        raise HttpError(403, "Forbidden")

    entry.delete()
    return HttpResponse(status=204)
