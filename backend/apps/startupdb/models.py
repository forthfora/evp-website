from __future__ import annotations

from django.conf import settings
from django.db import models


class Occupation(models.TextChoices):
    BACHELORS = "bachelors", "Bachelors"
    MASTERS = "masters", "Masters"
    PHD = "phd", "PhD"
    GRADUATED = "graduated", "Graduated"


class Founder(models.Model):
    id: int

    startups: models.Manager[StartupEntry]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    location = models.CharField(max_length=200, blank=True, default="")
    occupation = models.CharField(
        max_length=20, choices=Occupation.choices, default=Occupation.GRADUATED
    )

    linkedin = models.URLField(max_length=200, blank=True, default="")
    email = models.EmailField(max_length=200, blank=True, default="")

    notes = models.TextField(blank=True, default="")

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Founder"
        verbose_name_plural = "Founders"
        ordering = ("last_name", "first_name")
        constraints = [  # noqa: RUF012
            models.UniqueConstraint(
                fields=["first_name", "last_name"],
                name="unique_founder_name",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name}"

    @property
    def fullname(self) -> str:
        return self.first_name + " " + self.last_name


class StartupEntry(models.Model):
    id: int

    name = models.CharField(max_length=200, unique=True)
    founders = models.ManyToManyField(Founder, related_name="startups", blank=True)
    founding_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True, default="")

    website = models.URLField(max_length=200, blank=True, default="")
    linkedin = models.URLField(max_length=200, blank=True, default="")
    email = models.EmailField(max_length=200, blank=True, default="")

    location = models.CharField(max_length=200, blank=True, default="")
    notes = models.TextField(blank=True, default="")

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Startup"
        verbose_name_plural = "Startups"
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return self.name
