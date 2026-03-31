# accounts/admin.py
# Registers our models so we can see them in Django admin panel
# Visit http://localhost:8000/admin to see this

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Organization

# Register Organization model
admin.site.register(Organization)

# Register User with the built-in UserAdmin display
admin.site.register(User, UserAdmin)



## 🟦 STEP 20 — Test the server

""" Go to your **Command Prompt** and type:
python manage.py makemigrations

python manage.py migrate

python manage.py runserver


You should see:

Starting development server at http://127.0.0.1:8000/ """