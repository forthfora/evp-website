from ninja import Schema


class RequestOTPIn(Schema):
    email: str


class RequestOTPOut(Schema):
    exists: bool


class VerifyOTPIn(Schema):
    email: str
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


class MePatchIn(Schema):
    first_name: str | None = None
    last_name: str | None = None
    receives_update_emails: bool | None = None


class EmailChangeIn(Schema):
    email: str
    code: str


class MemberOut(Schema):
    username: str
    email: str
    first_name: str
    last_name: str
    role: str
    date_joined: str
    receives_update_emails: bool


class SendAllEmailIn(Schema):
    subject: str
    body: str


class SendAllEmailOut(Schema):
    subject: str
    body: str
    sent: int
    skipped: int
    failed: int
