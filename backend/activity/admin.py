# activity/admin.py
from django.contrib import admin
from .models import ActivityLog

# register activity model
admin.site.register(ActivityLog)
