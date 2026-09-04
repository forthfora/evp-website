from ninja import Schema
from pydantic import EmailStr


class CSRFOut(Schema):
    csrftoken: str


class ContactIn(Schema):
    name: str
    email: EmailStr
    message: str
