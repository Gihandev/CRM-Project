# config/urls.py
# Master URL file - connects all app urls together

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Django admin panel at /admin/
    path('admin/', admin.site.urls),

    # Auth URLs → register, login, profile etc
    path('api/v1/auth/', include('accounts.urls')),

    # CRM URLs → companies and contacts
    path('api/v1/', include('crm.urls')),

    # Activity log URLs
    path('api/v1/', include('activity.urls')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
