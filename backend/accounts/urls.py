

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # POST /api/v1/auth/register/ → Register new org + admin user
    path('register/', views.RegisterView.as_view(), name='register'),

    # POST /api/v1/auth/login/ → Login and get tokens
    path('login/', views.LoginView.as_view(), name='login'),

    # POST /api/v1/auth/token/refresh/ → Get new access token using refresh token
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # GET /api/v1/auth/profile/ → Get current user profile
    path('profile/', views.ProfileView.as_view(), name='profile'),

    # POST /api/v1/auth/users/add/ → Admin adds a new user
    path('users/add/', views.AddUserView.as_view(), name='add_user'),

    # GET /api/v1/auth/users/ → Admin lists all users in org
    path('users/', views.ListUsersView.as_view(), name='list_users'),
]