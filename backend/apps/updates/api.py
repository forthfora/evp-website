from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from ninja import Router

from apps.accounts.models import User
from apps.core.permissions import RoleAuth
from apps.updates.schemas import UpdateEmailIn, UpdateEmailOut

if TYPE_CHECKING:
    from django.http import HttpRequest
from apps.core.email import EmailSendError, send_email

logger = logging.getLogger(__name__)
router = Router(tags=["Updates"], auth=RoleAuth("admin"))


@router.post(
    "/send",
    response={200: UpdateEmailOut, 401: None, 403: None},
    summary="Send an update email to all opted-in members (admin only)",
)
def send_update_email(request: HttpRequest, payload: UpdateEmailIn) -> UpdateEmailOut:
    sent = 0
    skipped = 0
    failed = 0

    for user in User.objects.iterator():
        if not user.receives_update_emails:
            skipped += 1
            continue

        try:
            send_email(
                to=user.email,
                subject=payload.subject,
                body=payload.body,
            )
            sent += 1

        except EmailSendError:
            logger.exception("Failed to send OTP email")
            failed += 1

    return UpdateEmailOut(
        subject=payload.subject,
        body=payload.body,
        sent=sent,
        skipped=skipped,
        failed=failed,
    )
