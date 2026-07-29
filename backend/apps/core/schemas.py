from ninja import Schema


class ContactSchema(Schema):
    name: str
    email: str
    message: str


class SuccessResponse(Schema):
    success: str


class ErrorResponse(Schema):
    error: str
