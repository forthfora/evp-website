from ninja import Schema


class RequestOTPIn(Schema):
    email: str


class VerifyOTPIn(Schema):
    email: str
    code: str


class MeOut(Schema):
    id: int
    email: str
    role: str
    date_joined: str


class MemberOut(Schema):
    id: int
    email: str
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
