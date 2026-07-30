from __future__ import annotations

from datetime import date, datetime  # noqa: TC003

from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404
from ninja import Router, Schema

from apps.core.permissions import can_manage_entry, require_role
from apps.startupdb.models import Founder, StartupEntry

router = Router(tags=["StartupDB"])


class FounderOut(Schema):
    id: int
    first_name: str
    last_name: str
    location: str
    occupation: str
    linkedin: str
    email: str
    notes: str

    created_by_id: int
    created_at: datetime
    updated_at: datetime


class FounderIn(Schema):
    first_name: str
    last_name: str
    location: str = ""
    occupation: str = "graduated"
    linkedin: str = ""
    email: str = ""
    notes: str = ""


class FounderPatchIn(Schema):
    first_name: str | None = None
    last_name: str | None = None
    location: str | None = None
    occupation: str | None = None
    linkedin: str | None = None
    email: str | None = None
    notes: str | None = None


class EntryOut(Schema):
    id: int
    name: str
    description: str
    website: str
    linkedin: str
    email: str
    location: str
    notes: str
    founding_date: date | None
    founders: list[FounderOut]

    created_by_id: int
    created_at: datetime
    updated_at: datetime


class EntryIn(Schema):
    name: str
    description: str = ""
    website: str = ""
    linkedin: str = ""
    email: str = ""
    location: str = ""
    notes: str = ""
    founding_date: date | None = None
    founder_ids: list[int] = []  # noqa: RUF012


class EntryPatchIn(Schema):
    name: str | None = None
    description: str | None = None
    website: str | None = None
    linkedin: str | None = None
    email: str | None = None
    location: str | None = None
    notes: str | None = None
    founding_date: date | None = None
    founder_ids: list[int] | None = None


@router.get(
    "/startupdb/founders",
    response=list[FounderOut],
    auth=require_role("scout", "committee", "admin"),
    summary="List all founders",
)
def list_founders(request: HttpRequest) -> list[Founder]:
    """Return all founders (scout/committee/admin only)."""
    return list(Founder.objects.all())


@router.post(
    "/startupdb/founders",
    response=FounderOut,
    auth=require_role("scout", "committee", "admin"),
    summary="Create a founder",
)
def create_founder(request: HttpRequest, payload: FounderIn) -> Founder:
    """Create a new founder (scout/committee/admin only).

    ``created_by`` is always set from the authenticated user.
    """
    user = request.auth.user  # type: ignore[union-attr]
    return Founder.objects.create(
        first_name=payload.first_name,
        last_name=payload.last_name,
        location=payload.location,
        occupation=payload.occupation,
        linkedin=payload.linkedin,
        email=payload.email,
        notes=payload.notes,
        created_by=user,
    )


@router.patch(
    "/startupdb/founders/{founder_id}",
    response=FounderOut,
    auth=require_role("scout", "committee", "admin"),
    summary="Update a founder (owner or admin)",
)
def update_founder(
    request: HttpRequest,
    founder_id: int,
    payload: FounderPatchIn,
) -> Founder:
    """Update a founder. Scouts/committee may only update their own entries;
    admin may update any.
    """
    founder = get_object_or_404(Founder, id=founder_id)
    user = request.auth.user  # type: ignore[union-attr]

    if not can_manage_entry(user, founder):
        from ninja.errors import HttpError

        raise HttpError(403, "Forbidden")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(founder, field, value)
    founder.save()
    return founder


@router.delete(
    "/startupdb/founders/{founder_id}",
    response={204: None},
    auth=require_role("scout", "committee", "admin"),
    summary="Delete a founder (owner or admin)",
)
def delete_founder(
    request: HttpRequest,
    founder_id: int,
) -> HttpResponse:
    """Delete a founder. Scouts/committee may only delete their own entries;
    admin may delete any.
    """
    founder = get_object_or_404(Founder, id=founder_id)
    user = request.auth.user  # type: ignore[union-attr]

    if not can_manage_entry(user, founder):
        from ninja.errors import HttpError

        raise HttpError(403, "Forbidden")

    founder.delete()
    return HttpResponse(status=204)


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
    body must not contain it.
    """
    user = request.auth.user  # type: ignore[union-attr]
    data = payload.dict(exclude={"founder_ids"})
    entry = StartupEntry.objects.create(created_by=user, **data)
    if payload.founder_ids:
        entry.founders.set(Founder.objects.filter(id__in=payload.founder_ids))
    return entry


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
    """Update a startup entry.  Scouts/committee may only update their own entries;
    admin may update any entry.
    """
    entry = get_object_or_404(StartupEntry, id=entry_id)
    user = request.auth.user  # type: ignore[union-attr]

    if not can_manage_entry(user, entry):
        from ninja.errors import HttpError

        raise HttpError(403, "Forbidden")

    founder_ids = payload.founder_ids
    data = payload.dict(exclude_unset=True, exclude={"founder_ids"})
    for field, value in data.items():
        setattr(entry, field, value)
    if founder_ids is not None:
        entry.founders.set(Founder.objects.filter(id__in=founder_ids))
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

    if not can_manage_entry(user, entry):
        from ninja.errors import HttpError

        raise HttpError(403, "Forbidden")

    entry.delete()
    return HttpResponse(status=204)
