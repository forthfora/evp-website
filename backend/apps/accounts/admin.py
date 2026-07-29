from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from apps.accounts.models import User

# admin.register tells django to show a section for this model
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # defines the columns that will display in the admin panel for this model
    list_display = ("email", "role", "is_staff", "is_active", "date_joined")
    list_filter = ("role", "is_staff", "is_active") # defines filter sidebar options

    search_fields = ("email",) # can search by email
    ordering = ("email",) # default: alphabetically by email

    # defines the edit/create form
    fieldsets = (
        # (heading, fields shown)
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("image", "role")}),
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
