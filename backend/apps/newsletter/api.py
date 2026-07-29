from __future__ import annotations

from datetime import datetime  # noqa: TC003

from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404
from jwt_ninja.auth_classes import JWTAuth
from ninja import Router, Schema

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
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(issue, field, value)
    issue.save()
    return issue


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
