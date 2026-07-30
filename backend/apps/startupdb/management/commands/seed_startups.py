from __future__ import annotations

from django.core.management.base import BaseCommand

from apps.accounts.models import Role, User
from apps.startupdb.models import Founder, Occupation, StartupEntry


class Command(BaseCommand):
    help = "Seed the startup database with demo founders and startups."

    def handle(self, *args, **options) -> None:
        self._ensure_user()
        self._seed_founders()
        self._seed_startups()
        self.stdout.write(self.style.SUCCESS("Done seeding startup database."))

    def _ensure_user(self) -> User:
        user, created = User.objects.get_or_create(
            email="seed-admin@evp.local",
            defaults={"role": Role.ADMIN, "is_staff": True},
        )
        if created:
            self.stdout.write(f"  Created seed admin user: {user.email}")
        else:
            self.stdout.write(f"  Using existing user: {user.email}")
        return user

    def _seed_founders(self) -> dict[str, Founder]:
        founders_data = [
            ("Ada", "Lovelace", Occupation.PHD, "London"),
            ("Alan", "Turing", Occupation.PHD, "Manchester"),
            ("Grace", "Hopper", Occupation.PHD, "New York"),
            ("Linus", "Torvalds", Occupation.GRADUATED, "Helsinki"),
            ("Margaret", "Hamilton", Occupation.PHD, "Boston"),
        ]
        user = User.objects.first()
        if user is None:
            self.stdout.write(
                self.style.WARNING("No users found — creating seed admin.")
            )
            user, _ = User.objects.get_or_create(
                email="seed@evp.local",
                defaults={"is_superuser": True, "is_staff": True},
            )

        created = {}
        for first, last, occupation, location in founders_data:
            founder, _ = Founder.objects.get_or_create(
                first_name=first,
                last_name=last,
                defaults={
                    "occupation": occupation,
                    "location": location,
                    "created_by": user,
                },
            )
            created[f"{first} {last}"] = founder
            self.stdout.write(f"  Founder: {founder}")
        return created

    def _seed_startups(self) -> None:
        founders = {str(f): f for f in Founder.objects.all()}
        user = User.objects.first()
        if user is None:
            self.stdout.write(
                self.style.ERROR("No users exist — cannot seed startups.")
            )
            return

        startups_data = [
            {
                "name": "Analytics Engine",
                "description": "AI-powered data analytics platform for SMEs.",
                "website": "https://analytics-engine.example.com",
                "location": "Edinburgh",
                "founder_keys": ["Ada Lovelace", "Alan Turing"],
            },
            {
                "name": "Quantum Leap",
                "description": "Quantum computing consulting and education.",
                "website": "https://quantumleap.example.com",
                "location": "Edinburgh",
                "founder_keys": ["Alan Turing"],
            },
            {
                "name": "CodeBridge",
                "description": "Open-source collaboration tools for students.",
                "website": "https://codebridge.example.com",
                "location": "Glasgow",
                "founder_keys": ["Linus Torvalds", "Grace Hopper"],
            },
            {
                "name": "SpaceLink",
                "description": "Satellite communication solutions for remote areas.",
                "website": "https://spacelink.example.com",
                "location": "Glasgow",
                "founder_keys": ["Margaret Hamilton"],
            },
            {
                "name": "EduPulse",
                "description": "Peer-to-peer learning platform for university "
                "students.",
                "website": "https://edupulse.example.com",
                "location": "Edinburgh",
                "founder_keys": ["Ada Lovelace", "Margaret Hamilton"],
            },
        ]

        for data in startups_data:
            founder_keys = data.pop("founder_keys")
            entry, created = StartupEntry.objects.get_or_create(
                name=data["name"],
                defaults={
                    **data,
                    "created_by": user,
                },
            )
            if created:
                for key in founder_keys:
                    if key in founders:
                        entry.founders.add(founders[key])
                self.stdout.write(f"  Startup: {entry.name}")
            else:
                self.stdout.write(f"  Startup (exists): {entry.name}")
