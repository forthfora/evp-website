from django.contrib import admin

from apps.newsletter.models import NewsletterIssue


@admin.register(NewsletterIssue)
class NewsletterIssueAdmin(admin.ModelAdmin):
    list_display = ("title", "published_at", "created_by", "created_at")
    list_filter = ("published_at",)
    search_fields = ("title",)
