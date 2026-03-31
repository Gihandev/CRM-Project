# crm/urls.py
# URL routes for Company and Contact

from django.urls import path
from . import views

urlpatterns = [

    # ── Company URLs ──────────────────────────────
    # GET  /api/v1/companies/      → list all companies
    # POST /api/v1/companies/      → create a company
    path(
        'companies/',
        views.CompanyListCreateView.as_view(),
        name='company-list-create'
    ),

    # GET    /api/v1/companies/1/  → get company with id=1
    # PUT    /api/v1/companies/1/  → update company with id=1
    # DELETE /api/v1/companies/1/  → delete company with id=1
    path(
        'companies/<int:pk>/',
        views.CompanyDetailView.as_view(),
        name='company-detail'
    ),

    # ── Contact URLs ──────────────────────────────
    # GET  /api/v1/contacts/       → list all contacts
    # POST /api/v1/contacts/       → create a contact
    path(
        'contacts/',
        views.ContactListCreateView.as_view(),
        name='contact-list-create'
    ),

    # GET    /api/v1/contacts/1/   → get contact with id=1
    # PUT    /api/v1/contacts/1/   → update contact with id=1
    # DELETE /api/v1/contacts/1/   → delete contact with id=1
    path(
        'contacts/<int:pk>/',
        views.ContactDetailView.as_view(),
        name='contact-detail'
    ),
]