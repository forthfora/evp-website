from django.contrib import admin

from apps.directory.models import DirectoryEntry


@admin.register(DirectoryEntry)
class DirectoryEntryAdmin(admin.ModelAdmin):
    list_display = ("title", "created_by", "created_at")
    search_fields = ("title",)
