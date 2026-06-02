from django.conf import settings
from django.core.mail import send_mail
from ninja import Router

from apps.core.schemas import ContactSchema, ErrorResponse, SuccessResponse

router = Router()

@router.post("/contact", response={200: SuccessResponse, 500: ErrorResponse})
def send_contact_email(request, data: ContactSchema):
    email_subject = f"EVP Contact: {data.name}"
    email_body = (
        f"Name: {data.name}\n"
        f"Email: {data.email}\n\n"
        f"Message:\n{data.message}"
    )

    try:
        send_mail(
            subject=email_subject,
            message=email_body,
            from_email=settings.FROM_EMAIL,
            recipient_list=settings.TO_EMAILS,
            fail_silently=False,
        )
        return 200, {"success": "Message sent successfully!"}
        
    except Exception as e:
        return 500, {"error": f"Internal server error: {str(e)}"}