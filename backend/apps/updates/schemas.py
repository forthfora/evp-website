from ninja import Schema


class UpdateEmailIn(Schema):
    subject: str
    body: str


class UpdateEmailOut(Schema):
    subject: str
    body: str
    sent: int
    skipped: int
    failed: int
