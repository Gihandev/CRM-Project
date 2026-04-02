from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, Organization
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    AddUserSerializer,
    UpdateUserSerializer,
    OrganizationSerializer,
    CreateOrganizationSerializer,
)
from .permissions import IsAdminRole


# Helper function 
def get_tokens_for_user(user):
    """
    Generates JWT tokens for a user.
    Returns both access token (short lived) and
    refresh token (long lived).
    """
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# Register View 
class RegisterView(APIView):
    """
    POST /api/v1/auth/register/
    Anyone can register - no login required.
    Creates a new organization AND a new admin user together.
    """
    permission_classes = [AllowAny]  # No login needed to register

    def post(self, request):
        # Pass the incoming data to our serializer for validation
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            # Save the user (this calls our create() in the serializer)
            user = serializer.save()

            # Generate JWT tokens for the new user
            tokens = get_tokens_for_user(user)

            return Response({
                'message': 'Registration successful',
                'tokens': tokens,
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)

        # If validation failed, return the errors
        return Response({
            'message': 'Registration failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# Login View 
class LoginView(APIView):
    """
    POST /api/v1/auth/login/
    Anyone can login - no login required obviously.
    Returns JWT tokens if username/password are correct.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        # Get username and password from the request
        username = request.data.get('username')
        password = request.data.get('password')

        # Basic validation - make sure both fields are provided
        if not username or not password:
            return Response({
                'message': 'Please provide both username and password'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Try to find the user in database
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({
                'message': 'Invalid username or password'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Check if the password is correct
        if not user.check_password(password):
            return Response({
                'message': 'Invalid username or password'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Generate tokens and return them
        tokens = get_tokens_for_user(user)

        return Response({
            'message': 'Login successful',
            'tokens': tokens,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)


#  Profile View 
class ProfileView(APIView):
    """
    GET /api/v1/auth/profile/
    Returns the currently logged in user's profile.
    Must be logged in to access this.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


# Users List add 
class UserListCreateView(APIView):
    """
    POST/api/v1/auth/users/
    Returns all users in the same organization.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        # return all users in same org
        # FIX: User (capital U), not user
        users = User.objects.filter(
            organization=request.user.organization
        ).order_by('id')
        # FIX: True (capital T), not true
        return Response(UserSerializer(users, many=True).data)

    def post(self, request):
        serializer = AddUserSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User added Successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        # FIX: moved this return OUTSIDE the if block (was unreachable before)
        return Response({
            'message': 'Failed to add user',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# User Details (update and Delete)
class UserDetailView(APIView):
    """
    GET /api/v1/auth/users/<id>/
    Return users details, update or delete user.
    Only admins can update or delete users in their organization.
    Admins cannot change their own role or delete themselves.
    """
    # FIX: docstring and permission_classes now at same indent level (1 tab inside class)
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_user(self, pk, org):
        try:
            return User.objects.get(pk=pk, organization=org)
        except User.DoesNotExist:
            return None

    def put(self, request, pk):
        user = self.get_user(pk, request.user.organization)
        if not user:
            return Response(
                {'message': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Prevent admin from demoting themselves
        if user == request.user and request.data.get('role') != 'admin':
            return Response(
                {'message': 'You cannot change your own role'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = UpdateUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'User updated successfully',
                'user': UserSerializer(user).data
            })
        return Response({
            'message': 'Failed to update',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        user = self.get_user(pk, request.user.organization)
        if not user:
            return Response(
                {'message': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Prevent self-delete
        if user == request.user:
            return Response(
                {'message': 'You cannot delete your own account'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.delete()
        return Response({'message': 'User deleted successfully'})


# Organizations List
class OrganizationListCreateView(APIView):
    """
    POST /api/v1/auth/organizations/
    Returns all organizations.
    Only admins can see this list and create new organizations.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        # Admin sees all organizations
        orgs = Organization.objects.all().order_by('-created_at')
        return Response(OrganizationSerializer(orgs, many=True).data)

    def post(self, request):
        serializer = CreateOrganizationSerializer(data=request.data)
        if serializer.is_valid():
            org = serializer.save()
            return Response({
                'message': 'Organization created successfully',
                'organization': OrganizationSerializer(org).data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'message': 'Failed to create organization',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# Organization Details (update,delete)
class OrganizationDetailView(APIView):
    """
    GET /api/v1/auth/organizations/<id>/
    Return organization details, update or delete organization.
    Only admins can update or delete organizations.
    Admins cannot delete their own organization.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_org(self, pk):
        try:
            return Organization.objects.get(pk=pk)
        except Organization.DoesNotExist:
            return None

    def put(self, request, pk):
        org = self.get_org(pk)
        if not org:
            return Response(
                {'message': 'Organization not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = OrganizationSerializer(org, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Organization updated',
                'organization': OrganizationSerializer(org).data
            })
        return Response({'errors': serializer.errors},
                        status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        org = self.get_org(pk)
        if not org:
            return Response(
                {'message': 'Organization not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Prevent deleting own org
        if org == request.user.organization:
            return Response(
                {'message': 'Cannot delete your own organization'},
                status=status.HTTP_400_BAD_REQUEST
            )

        org.delete()
        return Response({'message': 'Organization deleted'})


#  Add User View 
class AddUserView(APIView):
    """
    POST /api/v1/auth/users/add/
    Only admins can add new users to their organization.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request):
        serializer = AddUserSerializer(
            data=request.data,
            context={'request': request}  # pass request so serializer knows the org
        )

        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User added successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)

        return Response({
            'message': 'Failed to add user',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# List Users View 
class ListUsersView(APIView):
    """
    GET /api/v1/auth/users/
    Returns all users in the same organization.
    Only admins can see this list.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        # Only get users from the same organization
        users = User.objects.filter(
            organization=request.user.organization
        )
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)