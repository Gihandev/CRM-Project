# crm/admin.py
from django.contrib import admin
from .models import Company, Contact


# register the company and contacts 
admin.site.register(Company)
admin.site.register(Contact)