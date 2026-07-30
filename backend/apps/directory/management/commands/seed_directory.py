from __future__ import annotations

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.directory.models import DirectoryEntry

User = get_user_model()

SEED_ENTRIES = [
    {
        "title": "EVP Startup Directory",
        "description": "A curated list of startups founded by UoE students and alumni.",
        "extra": {"url": "https://edinburghventurepoint.com/startups"},
    },
    {
        "title": "Mentor Network",
        "description": "Experienced entrepreneurs available for mentorship.",
        "extra": {"contact": "mentors@edinburghventurepoint.com"},
    },
    {
        "title": "Funding Opportunities",
        "description": "Grants, competitions, and investment opps for founders.",
        "extra": {"updated": "2026-07-01"},
    },
    {
        "title": "Coworking Spaces",
        "description": "Affordable coworking near the University of Edinburgh.",
        "extra": {"locations": ["Edinburgh Technopole", "The Bayes Centre"]},
    },
    {
        "title": "Legal & Accounting Resources",
        "description": "Legal and accounting firms familiar with early-stage startups.",
        "extra": {"disclaimer": "Not financial advice."},
    },
]


class Command(BaseCommand):
    help = "Seed the directory with sample entries for local development."

    def handle(self, *args, **options):
        # Use the first superuser or create a placeholder user
        user = User.objects.filter(is_superuser=True).first()
        if user is None:
            user = User.objects.create_superuser(
                "admin@evp.local",
                "admin@evp.local",
                password="temp_dev_pass_123",  # noqa: S106
            )
            self.stdout.write(f"Created superuser {user.email}")

        created = 0
        for data in SEED_ENTRIES:
            _, is_new = DirectoryEntry.objects.get_or_create(
                title=data["title"],
                defaults={
                    "description": data["description"],
                    "extra": data["extra"],
                    "created_by": user,
                },
            )
            if is_new:
                created += 1

        self.stdout.write(self.style.SUCCESS(f"Seeded {created} directory entries."))
