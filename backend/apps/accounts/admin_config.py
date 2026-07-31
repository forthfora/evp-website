from django.contrib.admin.apps import AdminConfig


class AccountsAdminConfig(AdminConfig):
    default_site = "apps.accounts.admin_site.SuperuserOnlyAdminSite"
