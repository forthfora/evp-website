from __future__ import annotations

from typing import TYPE_CHECKING

from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404
from ninja import Router
from ninja.errors import HttpError

from apps.core.permissions import RoleAuth, can_manage_entry
from apps.startupdb.models import Founder, StartupEntry
from apps.startupdb.schemas import (
    FounderIn,
    FounderOut,
    FounderPatchIn,
    StartupIn,
    StartupOut,
    StartupPatchIn,
)

if TYPE_CHECKING:
    from apps.accounts.models import User

router = Router(tags=["StartupDB"], auth=RoleAuth("admin", "committee", "scout"))


@router.get(
    "/founders",
    response={
        200: list[FounderOut],
        401: None,
        403: None,
    },
    summary="List all founders.",
)
def list_founders(request: HttpRequest):
    return list(Founder.objects.all())


@router.post(
    "/founders",
    response={201: FounderOut, 401: None, 403: None},
    summary="Create a founder.",
)
def create_founder(request: HttpRequest, payload: FounderIn):
    user = request.user
    founder = Founder.objects.create(
        first_name=payload.first_name,
        last_name=payload.last_name,
        location=payload.location,
        occupation=payload.occupation,
        linkedin=payload.linkedin,
        email=payload.email,
        notes=payload.notes,
        created_by=user,
    )
    return 201, founder


@router.patch(
    "/founders/{founder_id}",
    response={200: FounderOut, 401: None, 403: None, 404: None},
    summary="Update a founder. (owner or admin)",
)
def update_founder(
    request: HttpRequest,
    founder_id: int,
    payload: FounderPatchIn,
):
    founder = get_object_or_404(Founder, id=founder_id)
    user: User = request.user  # type: ignore

    if not can_manage_entry(user, founder):
        raise HttpError(403, "Forbidden")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(founder, field, value)

    founder.save()
    return founder


@router.delete(
    "/founders/{founder_id}",
    response={204: None, 401: None, 403: None, 404: None},
    summary="Delete a founder. (owner or admin)",
)
def delete_founder(
    request: HttpRequest,
    founder_id: int,
):
    founder = get_object_or_404(Founder, id=founder_id)
    user: User = request.user  # type: ignore

    if not can_manage_entry(user, founder):
        raise HttpError(403, "Forbidden")

    founder.delete()
    return HttpResponse(status=204)


@router.get(
    "/",
    response={200: list[StartupOut], 401: None, 403: None},
    summary="List all startup entries.",
)
def list_entries(request: HttpRequest):
    return list(StartupEntry.objects.all())


@router.post(
    "/",
    response={201: StartupOut, 401: None, 403: None},
    summary="Create a new startup entry.",
)
def create_entry(request: HttpRequest, payload: StartupIn):
    user: User = request.user  # type: ignore
    data = payload.model_dump(exclude={"founder_ids"})
    entry = StartupEntry.objects.create(created_by=user, **data)

    if payload.founder_ids:
        entry.founders.set(Founder.objects.filter(id__in=payload.founder_ids))

    return 201, entry


@router.patch(
    "/{entry_id}",
    response={200: StartupOut, 401: None, 403: None, 404: None},
    summary="Update a startup entry. (owner or admin)",
)
def update_entry(
    request: HttpRequest,
    entry_id: int,
    payload: StartupPatchIn,
):
    entry = get_object_or_404(StartupEntry, id=entry_id)
    user: User = request.user  # type: ignore

    if not can_manage_entry(user, entry):
        raise HttpError(403, "Forbidden")

    founder_ids = payload.founder_ids
    data = payload.model_dump(exclude_unset=True, exclude={"founder_ids"})

    for field, value in data.items():
        setattr(entry, field, value)

    if founder_ids is not None:
        entry.founders.set(Founder.objects.filter(id__in=founder_ids))

    entry.save()
    return entry


@router.delete(
    "/{entry_id}",
    response={204: None, 401: None, 403: None, 404: None},
    summary="Delete a startup entry. (owner or admin)",
)
def delete_entry(
    request: HttpRequest,
    entry_id: int,
):
    entry = get_object_or_404(StartupEntry, id=entry_id)
    user: User = request.user  # type: ignore

    if not can_manage_entry(user, entry):
        raise HttpError(403, "Forbidden")

    entry.delete()
    return HttpResponse(status=204)
