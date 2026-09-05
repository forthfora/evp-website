from datetime import datetime

from ninja import Schema
from pydantic import EmailStr, Field

from apps.core.schemas import PatchSchema


class RequestOTPIn(Schema):
    email: EmailStr


class RequestOTPOut(Schema):
    exists: bool


class VerifyOTPIn(Schema):
    email: EmailStr
    code: str


class VerifyOTPOut(Schema):
    created: bool


class MeOut(Schema):
    username: str
    email: str
    role: str
    date_joined: str
    first_name: str
    last_name: str
    receives_update_emails: bool


class MePatchIn(PatchSchema):
    first_name: str | None = None
    last_name: str | None = None
    receives_update_emails: bool | None = None


class EmailChangeIn(Schema):
    email: EmailStr
    code: str


class MemberOut(MeOut):
    """Member list item — identical shape to the profile (`MeOut`)."""


class SendAllEmailIn(Schema):
    # Bounded to match SendAllJob.subject — an oversized subject would
    # otherwise surface as a database DataError (500).
    subject: str = Field(max_length=255)
    body: str


class SendAllEmailOut(Schema):
    subject: str
    body: str
    queued: int
    skipped: int
    job_id: int


class SendAllJobOut(Schema):
    id: int
    subject: str
    total: int
    sent: int
    failed: int
    created_at: datetime
    finished_at: datetime | None
