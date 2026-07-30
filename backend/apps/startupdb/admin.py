from django.contrib import admin

from apps.startupdb.models import StartupEntry


@admin.register(StartupEntry)
class StartupEntryAdmin(admin.ModelAdmin):
    list_display = ("name", "created_by", "created_at")
    search_fields = ("name",)
