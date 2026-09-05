from django.contrib import admin

from apps.startupdb.models import Founder, StartupEntry


@admin.register(StartupEntry)
class StartupEntryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "get_founders",
        "founding_date",
        "description",
        "website",
        "linkedin",
        "email",
        "location",
        "notes",
        "created_by",
        "created_at",
    )
    search_fields = ("name",)
    filter_horizontal = ("founders",)

    @admin.display(description="Founders")
    def get_founders(self, obj):
        return ", ".join([founder.fullname for founder in obj.founders.all()])

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.prefetch_related("founders")


@admin.register(Founder)
class FounderAdmin(admin.ModelAdmin):
    list_display = (
        "first_name",
        "last_name",
        "location",
        "occupation",
        "email",
        "linkedin",
        "notes",
        "created_by",
        "created_at",
    )
    search_fields = ("first_name", "last_name")
    list_filter = ("occupation",)
