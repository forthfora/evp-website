from ninja import Schema


class CSRFOut(Schema):
    csrftoken: str


class ContactIn(Schema):
    name: str
    email: str
    message: str
