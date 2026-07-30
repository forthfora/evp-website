from __future__ import annotations

from django.conf import settings
from django.db import models


class DirectoryEntry(models.Model):
    """A flexible, admin-defined directory entry.

    The ``extra`` JSONField holds whatever ad-hoc fields are needed until
    a real schema is defined.  Scouts and Committee may create entries;
    entries are owned by their creator.
    """

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    extra = models.JSONField(default=dict, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Directory Entry"
        verbose_name_plural = "Directory Entries"
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return self.title
