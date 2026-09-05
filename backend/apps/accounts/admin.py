from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from apps.accounts.models import SendAllJob, User


# admin.register tells django to show a section for this model
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # defines the columns that will display in the admin panel for this model
    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "role",
        "is_staff",
        "is_active",
        "receives_update_emails",
        "date_joined",
    )
    list_filter = ("role", "is_staff", "is_active")  # defines filter sidebar options

    search_fields = ("email",)  # can search by email
    ordering = ("email",)  # default: alphabetically by email

    # defines the edit/create form
    fieldsets = (
        # (heading, fields shown)
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name", "role")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    # defines the form when first creating a user
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password1", "password2"),
            },
        ),
    )


@admin.register(SendAllJob)
class SendAllJobAdmin(admin.ModelAdmin):
    """View-only admin for send-all delivery history.

    Job rows are written by the background dispatch thread; admins can
    inspect results here but not create/edit them through the admin.
    """

    list_display = (
        "id",
        "subject",
        "created_by",
        "total",
        "sent",
        "failed",
        "created_at",
        "finished_at",
    )
    list_filter = ("created_at",)
    search_fields = ("subject",)
    ordering = ("-created_at",)

    def has_add_permission(self, request) -> bool:
        return False

    def has_change_permission(self, request, obj=None) -> bool:
        return False

    def has_delete_permission(self, request, obj=None) -> bool:
        return False
