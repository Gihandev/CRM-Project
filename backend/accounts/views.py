

from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    AddUserSerializer
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
        # request.user is automatically set by JWT authentication
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


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