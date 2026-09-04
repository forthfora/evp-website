import logging

from django.conf import settings
from django.http import HttpResponse
from django.middleware.csrf import get_token
from ninja import Router
from ninja.errors import HttpError

from apps.core.email import EmailSendError, send_email
from apps.core.ratelimit import ratelimit
from apps.core.schemas import ContactIn, CSRFOut

logger = logging.getLogger(__name__)

router = Router(tags=["Core"])


@router.get(
    "/csrf",
    auth=None,
    response={200: CSRFOut},
    summary="Returns CSRF token.",
)
@ratelimit(key="ip", rate="60/m", block=True)
def get_csrf(request):
    return {"csrftoken": get_token(request)}


@router.post(
    "/contact",
    auth=None,
    response={204: None, 500: None},
    summary="Sends a contact email to EVP.",
)
@ratelimit(key="ip", rate="5/10m", block=True)
def send_contact_email(request, data: ContactIn):
    email_subject = f"EVP Contact: {data.name}"
    email_body = f"Name: {data.name}\nEmail: {data.email}\n\nMessage:\n{data.message}"

    try:
        send_email(
            to=settings.TO_EMAILS,
            subject=email_subject,
            body=email_body,
            from_email=settings.FROM_EMAIL,
        )
        return HttpResponse(status=204)

    except EmailSendError as err:
        logger.exception("Unexpected error calling send_email")
        raise HttpError(
            500,
            "An unexpected error occured. Our email server may be down. Please try again later.",  # noqa: E501
        ) from err
