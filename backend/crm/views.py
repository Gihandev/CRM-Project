# crm/views.py


from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404

from .models import Company, Contact
from .serializers import (
    CompanySerializer,
    CompanyDetailSerializer,
    ContactSerializer
)
from accounts.permissions import (
    IsAdminRole,
    IsManagerOrAdmin,
    TenantPermission
)
from activity.utils import log_activity



#  COMPANY VIEWS


class CompanyListCreateView(APIView):
    """
    GET  /api/v1/companies/     → List all companies in my organization
    POST /api/v1/companies/     → Create a new company
    
    Supports:
    - Search by name: ?search=google
    - Filter by industry: ?industry=Tech
    - Filter by country: ?country=USA
    - Pagination: ?page=1
    """

    permission_classes = [IsAuthenticated]

    # Accept JSON, form-data, and file uploads (for logo)
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    def get(self, request):
        # Step 1: Get only companies from MY organization
        # This is tenant isolation - very important!
        companies = Company.objects.filter(
            organization=request.user.organization,
            is_deleted=False  # exclude soft deleted companies
        )

        # Step 2: Search by name if ?search=... is in the URL
        search = request.query_params.get('search')
        if search:
            companies = companies.filter(name__icontains=search)
            # icontains means case-insensitive search

        # Step 3: Filter by industry if ?industry=... is in the URL
        industry = request.query_params.get('industry')
        if industry:
            companies = companies.filter(industry__icontains=industry)

        # Step 4: Filter by country if ?country=... is in the URL
        country = request.query_params.get('country')
        if country:
            companies = companies.filter(country__icontains=country)

        # Step 5: Simple manual pagination
        page = int(request.query_params.get('page', 1))
        page_size = 10
        start = (page - 1) * page_size  # e.g. page 2 starts at index 10
        end = start + page_size          # e.g. page 2 ends at index 20

        total = companies.count()
        companies_page = companies[start:end]

        serializer = CompanySerializer(companies_page, many=True)

        return Response({
            'count': total,
            'page': page,
            'page_size': page_size,
            'results': serializer.data
        })

    def post(self, request):
        serializer = CompanySerializer(data=request.data)

        if serializer.is_valid():
            # Save and automatically attach the user's organization
            company = serializer.save(
                organization=request.user.organization
            )

            # Record this action in the activity log
            log_activity(request.user, 'CREATE', 'Company', company.id)

            return Response({
                'message': 'Company created successfully',
                'data': CompanySerializer(company).data
            }, status=status.HTTP_201_CREATED)

        return Response({
            'message': 'Failed to create company',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)





class CompanyDetailView(APIView):
    """
    GET    /api/v1/companies/<id>/   → Get one company with its contacts
    PUT    /api/v1/companies/<id>/   → Update a company (managers and admins)
    DELETE /api/v1/companies/<id>/   → Soft delete a company (admins only)
    """
    permission_classes = [IsAuthenticated]

    def get_company(self, company_id, organization):
        """
        Helper method to get a company safely.
        Makes sure the company belongs to the user's organization.
        This prevents users from accessing other org's data.
        """
        return get_object_or_404(
            Company,
            id=company_id,
            organization=organization,  # tenant isolation check
            is_deleted=False
        )

    def get(self, request, pk):
        # pk = primary key = the company ID in the URL
        company = self.get_company(pk, request.user.organization)

        # Use the detail serializer which includes contacts
        serializer = CompanyDetailSerializer(company)
        return Response(serializer.data)

    def put(self, request, pk):
        # Only managers and admins can edit
        if request.user.role not in ['admin', 'manager']:
            return Response({
                'message': 'You do not have permission to edit companies.'
            }, status=status.HTTP_403_FORBIDDEN)

        company = self.get_company(pk, request.user.organization)

        # partial=True means we can update just some fields
        serializer = CompanySerializer(
            company,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            company = serializer.save()

            # Record this update in activity log
            log_activity(request.user, 'UPDATE', 'Company', company.id)

            return Response({
                'message': 'Company updated successfully',
                'data': CompanySerializer(company).data
            })

        return Response({
            'message': 'Failed to update company',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        # Only admins can delete
        if request.user.role != 'admin':
            return Response({
                'message': 'Only admins can delete companies.'
            }, status=status.HTTP_403_FORBIDDEN)

        company = self.get_company(pk, request.user.organization)

        # Soft delete - we do NOT actually remove from database
        # We just set is_deleted = True
        # This way we can recover data if needed
        company.is_deleted = True
        company.save()

        # Record deletion in activity log
        log_activity(request.user, 'DELETE', 'Company', company.id)

        return Response({
            'message': 'Company deleted successfully'
        }, status=status.HTTP_200_OK)








#  CONTACT VIEWS


class ContactListCreateView(APIView):
    """
    GET  /api/v1/contacts/    → List all contacts in my organization
    POST /api/v1/contacts/    → Create a new contact
    
    Supports:
    - Search by name or email: ?search=john
    - Filter by company: ?company=1
    - Pagination: ?page=1
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get only contacts from MY organization
        contacts = Contact.objects.filter(
            organization=request.user.organization,
            is_deleted=False
        )

        # Search by name or email
        search = request.query_params.get('search')
        if search:
            # Filter by name OR email containing the search term
            from django.db.models import Q
            contacts = contacts.filter(
                Q(full_name__icontains=search) |
                Q(email__icontains=search)
            )

        # Filter by company ID
        company_id = request.query_params.get('company')
        if company_id:
            contacts = contacts.filter(company_id=company_id)

        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = 10
        start = (page - 1) * page_size
        end = start + page_size

        total = contacts.count()
        contacts_page = contacts[start:end]

        serializer = ContactSerializer(contacts_page, many=True)

        return Response({
            'count': total,
            'page': page,
            'page_size': page_size,
            'results': serializer.data
        })

    def post(self, request):
        serializer = ContactSerializer(data=request.data)

        if serializer.is_valid():
            # Make sure the company belongs to the user's organization
            # before creating a contact for it
            company = get_object_or_404(
                Company,
                id=request.data.get('company'),
                organization=request.user.organization,
                is_deleted=False
            )

            contact = serializer.save(
                organization=request.user.organization,
                company=company
            )

            # Log the creation
            log_activity(request.user, 'CREATE', 'Contact', contact.id)

            return Response({
                'message': 'Contact created successfully',
                'data': ContactSerializer(contact).data
            }, status=status.HTTP_201_CREATED)

        return Response({
            'message': 'Failed to create contact',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)







class ContactDetailView(APIView):
    """
    GET    /api/v1/contacts/<id>/  → Get one contact
    PUT    /api/v1/contacts/<id>/  → Update a contact
    DELETE /api/v1/contacts/<id>/  → Soft delete a contact
    """
    permission_classes = [IsAuthenticated]

    def get_contact(self, contact_id, organization):
        """
        Helper to safely get a contact that belongs to the user's org.
        """
        return get_object_or_404(
            Contact,
            id=contact_id,
            organization=organization,
            is_deleted=False
        )

    def get(self, request, pk):
        contact = self.get_contact(pk, request.user.organization)
        serializer = ContactSerializer(contact)
        return Response(serializer.data)

    def put(self, request, pk):
        # Only managers and admins can edit
        if request.user.role not in ['admin', 'manager']:
            return Response({
                'message': 'You do not have permission to edit contacts.'
            }, status=status.HTTP_403_FORBIDDEN)

        contact = self.get_contact(pk, request.user.organization)

        serializer = ContactSerializer(
            contact,
            data=request.data,
            partial=True  # allow partial updates
        )

        if serializer.is_valid():
            contact = serializer.save()

            # Log the update
            log_activity(request.user, 'UPDATE', 'Contact', contact.id)

            return Response({
                'message': 'Contact updated successfully',
                'data': ContactSerializer(contact).data
            })

        return Response({
            'message': 'Failed to update contact',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        # Only admins can delete
        if request.user.role != 'admin':
            return Response({
                'message': 'Only admins can delete contacts.'
            }, status=status.HTTP_403_FORBIDDEN)

        contact = self.get_contact(pk, request.user.organization)

        # Soft delete
        contact.is_deleted = True
        contact.save()

        # Log the deletion
        log_activity(request.user, 'DELETE', 'Contact', contact.id)

        return Response({
            'message': 'Contact deleted successfully'
        }, status=status.HTTP_200_OK)