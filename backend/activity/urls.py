# activity/urls.py
# URL routes for activity log

from django.urls import path
from . import views

urlpatterns = [
    # GET /api/v1/activity/  → list all activity logs
    path(
        'activity/',
        views.ActivityLogListView.as_view(),
        name='activity-log'
    ),
]