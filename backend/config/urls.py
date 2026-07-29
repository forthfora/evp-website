"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from django.views.generic.base import RedirectView

# see api.py for NinjaAPI declaration, exception handlers, etc.
from config.api import api

urlpatterns = [
    path("admin", RedirectView.as_view(url="/admin/", permanent=True)),
    path("admin/", admin.site.urls),
    path("api/", api.urls),
]

if settings.DEBUG:
    # serve directly from media directory, for testing
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


# style admin panel
admin.site.site_header = "EVP Admin Portal"
admin.site.site_title = "Admin Portal"
admin.site.index_title = "EVP"
