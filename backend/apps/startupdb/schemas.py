from datetime import date, datetime

from ninja import Schema


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
