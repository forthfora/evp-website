from __future__ import annotations

from django.conf import settings
from django.db import models


class StartupEntry(models.Model):
    id: int

    name = models.CharField(max_length=200)
    founders = models.CharField(max_length=200)

    website = models.URLField(max_length=200)
    email = models.EmailField(max_length=200)

    description = models.TextField(blank=True, default="")

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Startup Entry"
        verbose_name_plural = "Startup Entries"
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return self.name
