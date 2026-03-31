
import re
from rest_framework import serializers
from .models import Company, Contact


class CompanySerializer(serializers.ModelSerializer):
    """
    Handles converting Company objects to/from JSON.
    Used for listing and creating companies.
    """

    class Meta:
        model = Company
        fields = [
            'id',
            'name',
            'industry',
            'country',
            'logo',
            'is_deleted',
            'created_at'
        ]
      
        read_only_fields = ['id', 'created_at', 'is_deleted']


class CompanyDetailSerializer(serializers.ModelSerializer):
    """
    Same as CompanySerializer but also includes
    the list of contacts inside this company.
    Used when viewing a single company's detail page.
    """
    # This will include all contacts inside the company
    # ContactSerializer is defined below - we reference it by name
    contacts = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            'id',
            'name',
            'industry',
            'country',
            'logo',
            'is_deleted',
            'created_at',
            'contacts'   # nested contacts list
        ]
        read_only_fields = ['id', 'created_at', 'is_deleted']

    def get_contacts(self, obj):
        """
        Gets all active (not deleted) contacts for this company.
        obj = the Company instance we are serializing.
        """
        # Only return contacts that are not soft deleted
        active_contacts = obj.contacts.filter(is_deleted=False)
        return ContactSerializer(active_contacts, many=True).data


class ContactSerializer(serializers.ModelSerializer):
    """
    Handles converting Contact objects to/from JSON.
    Also includes custom validation for phone and email.
    """

    class Meta:
        model = Contact
        fields = [
            'id',
            'company',
            'full_name',
            'email',
            'phone',
            'role',
            'is_deleted',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'is_deleted']

    def validate_phone(self, value):
        """
        Custom phone validation.
        Phone is optional - but if provided it must be 8 to 15 digits only.
        """
        # If phone is empty just return it as is - it's optional
        if not value:
            return value

        # Remove spaces from phone number before checking
        cleaned = value.replace(' ', '')

        # Check if phone contains only digits
        if not cleaned.isdigit():
            raise serializers.ValidationError(
                'Phone number must contain digits only.'
            )

        # Check length is between 8 and 15 digits
        if not (8 <= len(cleaned) <= 15):
            raise serializers.ValidationError(
                'Phone number must be between 8 and 15 digits.'
            )

        return cleaned

    def validate_email(self, value):
        """
        Custom email validation.
        Email must be unique within the same company.
        We need to check this manually because the uniqueness
        depends on BOTH the company AND the email together.
        """
        # Get the company from the request data
        # self.initial_data has the raw incoming request data
        company_id = self.initial_data.get('company')

        if company_id:
            # Check if a contact with this email already exists in this company
            existing = Contact.objects.filter(
                company_id=company_id,
                email=value,
                is_deleted=False
            )

            # If we are updating (not creating), exclude the current contact
            # self.instance is set when we are doing an update
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)

            if existing.exists():
                raise serializers.ValidationError(
                    'A contact with this email already exists in this company.'
                )

        return value