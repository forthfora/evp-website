from __future__ import annotations

from typing import TYPE_CHECKING

from ninja import Router, Schema

from apps.accounts.models import User

if TYPE_CHECKING:
    from django.http import HttpRequest
from apps.core.email import send_email
from apps.core.permissions import require_role

router = Router(tags=["Updates"])


class UpdateEmailIn(Schema):
    subject: str
    body: str


class UpdateEmailOut(Schema):
    subject: str
    body: str
    sent: int
    skipped: int
    failed: int


@router.post(
    "/updates/send",
    response=UpdateEmailOut,
    auth=require_role("admin"),
    summary="Send an update email to all opted-in members (admin only)",
)
def send_update_email(request: HttpRequest, payload: UpdateEmailIn) -> UpdateEmailOut:
    """Send *body* with *subject* to every member who has not opted out.

    Returns counts of sent, skipped (opted-out), and failed deliveries.
    Synchronous fan-out — acceptable at current membership scale.
    """
    sent = 0
    skipped = 0
    failed = 0

    for user in User.objects.iterator():
        if not user.receives_update_emails:
            skipped += 1
            continue

        result = send_email(
            to=user.email,
            subject=payload.subject,
            body=payload.body,
        )

        if result.success:
            sent += 1
        else:
            failed += 1

    return UpdateEmailOut(
        subject=payload.subject,
        body=payload.body,
        sent=sent,
        skipped=skipped,
        failed=failed,
    )
