from django.conf import settings
from ninja import Router

from apps.core.email import send_email
from apps.core.schemas import ContactSchema, ErrorResponse, SuccessResponse

router = Router()


@router.post("/contact", response={200: SuccessResponse, 500: ErrorResponse})
def send_contact_email(request, data: ContactSchema):
    email_subject = f"EVP Contact: {data.name}"
    email_body = f"Name: {data.name}\nEmail: {data.email}\n\nMessage:\n{data.message}"

    try:
        result = send_email(
            to=settings.TO_EMAILS,
            subject=email_subject,
            body=email_body,
            from_email=settings.FROM_EMAIL,
        )

        if result.success:
            return 200, {"success": "Message sent successfully!"}
        return 500, {"error": result.message}

    except Exception as e:
        return 500, {"error": f"Internal server error: {e!s}"}
