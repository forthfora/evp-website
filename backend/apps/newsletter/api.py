from __future__ import annotations

from datetime import datetime  # noqa: TC003

from django.conf import settings
from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404
from jwt_ninja.auth_classes import JWTAuth
from ninja import Router, Schema

from apps.accounts.models import User
from apps.core.email import send_email
from apps.core.permissions import require_role
from apps.newsletter.models import NewsletterIssue

router = Router(tags=["Newsletter"])


class IssueOut(Schema):
    id: int
    title: str
    body: str
    published_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class IssueIn(Schema):
    title: str
    body: str


class IssuePatchIn(Schema):
    title: str | None = None
    body: str | None = None
    published_at: datetime | None = None


@router.get(
    "/newsletter/issues",
    response=list[IssueOut],
    auth=JWTAuth(),
    summary="List published newsletter issues",
)
def list_issues(request: HttpRequest) -> list[NewsletterIssue]:
    """Return all published issues (any authenticated user)."""
    return list(NewsletterIssue.published())


@router.post(
    "/newsletter/issues",
    response=IssueOut,
    auth=require_role("committee"),
    summary="Create a newsletter issue",
)
def create_issue(request: HttpRequest, payload: IssueIn) -> NewsletterIssue:
    """Create a new newsletter issue (committee only)."""
    user = request.auth.user  # type: ignore[union-attr]
    return NewsletterIssue.objects.create(
        title=payload.title,
        body=payload.body,
        created_by=user,
    )


@router.patch(
    "/newsletter/issues/{issue_id}",
    response=IssueOut,
    auth=require_role("committee"),
    summary="Update a newsletter issue",
)
def update_issue(
    request: HttpRequest,
    issue_id: int,
    payload: IssuePatchIn,
) -> NewsletterIssue:
    """Update an existing newsletter issue (committee only)."""
    issue = get_object_or_404(NewsletterIssue, id=issue_id)

    was_published = issue.published_at is not None
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(issue, field, value)
    issue.save()

    # Notify subscribers when an issue transitions to published
    now_published = issue.published_at is not None
    if not was_published and now_published:
        _notify_subscribers(issue)

    return issue


def _notify_subscribers(issue: NewsletterIssue) -> None:
    """Send an email notification for a newly published issue to all
    subscribed users.

    This is called explicitly from the publish endpoint rather than via
    a Django signal, for clarity and testability.
    """
    subscribers = User.objects.filter(receives_newsletter_emails=True)
    body = _build_newsletter_html(issue)
    for user in subscribers:
        send_email(
            to=user.email,
            subject=f"New EVP Newsletter: {issue.title}",
            body=body,
            from_email=settings.FROM_EMAIL,
        )


def _build_newsletter_html(issue: NewsletterIssue) -> str:
    """Build a minimal HTML email body for a newsletter issue."""
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; padding: 2rem;">
    <h1>{issue.title}</h1>
    <p>{issue.body}</p>
    <hr>
    <p style="color: #666; font-size: 0.85rem;">
        You are receiving this because you are a member of Edinburgh
        VenturePoint.
    </p>
</body>
</html>"""


@router.delete(
    "/newsletter/issues/{issue_id}",
    response={204: None},
    auth=require_role("committee"),
    summary="Delete a newsletter issue",
)
def delete_issue(
    request: HttpRequest,
    issue_id: int,
) -> HttpResponse:
    """Delete a newsletter issue (committee only)."""
    issue = get_object_or_404(NewsletterIssue, id=issue_id)
    issue.delete()
    return HttpResponse(status=204)
