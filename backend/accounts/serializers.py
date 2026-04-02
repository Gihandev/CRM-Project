
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Organization


# serialize organization and user data to JSON and back
class OrganizationSerializer(serializers.ModelSerializer):
    user_count = serializers.SerializerMethodField()  

    class Meta:
        model = Organization
        fields = ['id', 'name', 'subscription_plan', 'created_at', 'user_count']

    def get_user_count(self, obj):   
        return obj.users.count()



# serialize user data to JSON and back
class RegisterSerializer(serializers.ModelSerializer):
  # used for user registration, includes organization name 
    org_name = serializers.CharField(write_only=True, required=True)

    password = serializers.CharField(
        write_only=True,  # Don't include password in API responses
        required=True,
        validators=[validate_password] 
    )

    # fields for JSON response and input
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'org_name']

    # create new user
    def create(self, validated_data):
        org_name = validated_data.pop('org_name')
        organization = Organization.objects.create(name=org_name)

       # user createer
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            organization=organization,
            role='admin'  # First user of an org is always admin
        )

        return user



# serialize user data to JSON and back
class UserSerializer(serializers.ModelSerializer):
   # include organization details in user response
    organization = OrganizationSerializer(read_only=True)
    # fields for JSON response
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'organization']


# serialize user data to JSON and back
class AddUserSerializer(serializers.ModelSerializer):
   # add new user to existing organization, no org name needed
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    # fields for JSON response and input
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']

# create new user in the same organization as the requester
    def create(self, validated_data):
      # determine organization from the logged in user (requester)
        organization = self.context['request'].user.organization
        # create new user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            organization=organization,
            role=validated_data.get('role', 'staff')
        )

        # return the newly created user
        return user


# serialize user data to JSON and back
class UpdateUserSerializer(serializers.ModelSerializer):
    # fields for JSON response 
    class Meta:
        model  = User
        fields = ['username', 'email', 'role']


# serialize organization data to JSON and back
class CreateOrganizationSerializer(serializers.ModelSerializer):
    # Admin username for the new org
    admin_username = serializers.CharField(write_only=True)
    admin_password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )
    admin_email = serializers.EmailField(write_only=True, required=False)

# field for JSON response
    class Meta:
        model  = Organization
        fields = [
            'name', 'subscription_plan',
            'admin_username', 'admin_password', 'admin_email'
        ]

    def create(self, validated_data):
        admin_username = validated_data.pop('admin_username')
        admin_password = validated_data.pop('admin_password')
        admin_email    = validated_data.pop('admin_email', '')

        # Create organization
        organization = Organization.objects.create(**validated_data)

        # Create admin user for that org
        User.objects.create_user(
            username=admin_username,
            email=admin_email,
            password=admin_password,
            organization=organization,
            role='admin'
        )
        return organization

        