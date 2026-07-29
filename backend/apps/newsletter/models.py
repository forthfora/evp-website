from __future__ import annotations

from django.conf import settings
from django.db import models


class NewsletterIssue(models.Model):
    """A newsletter issue that can be published to members."""

    title = models.CharField(max_length=200)
    body = models.TextField()
    published_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Newsletter Issue"
        verbose_name_plural = "Newsletter Issues"
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return self.title

    @classmethod
    def published(cls):
        """Return a queryset of issues that have been published."""
        return cls.objects.filter(published_at__isnull=False)
