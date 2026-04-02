

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [

    #-----Auth-----

    # POST /api/v1/auth/register/ → Register new org + admin user
    path('register/', views.RegisterView.as_view(), name='register'),

    # POST /api/v1/auth/login/ → Login and get tokens
    path('login/', views.LoginView.as_view(), name='login'),

    # POST /api/v1/auth/token/refresh/ → Get new access token using refresh token
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # GET /api/v1/auth/profile/ → Get current user profile
    path('profile/', views.ProfileView.as_view(), name='profile'),



    #-----Users-----

    # POST /api/v1/auth/users/add/ → Admin adds a new user
    path('users/add/', views.AddUserView.as_view(), name='add_user'),
    path('users/', views.UserListCreateView.as_view(), name='user-list-create'),

    # GET /api/v1/auth/users/ → Admin lists all users in org
    path('users/<int:pk>/', views.UserDetailView.as_view(),name='user-detail'),



    #------Org------

    # POST /api/v1/auth/organizations/add/ → Admin creates a new organization
    path('organizations/',views.OrganizationListCreateView.as_view(), name='orgs'),
    path('organizations/<int:pk>/', views.OrganizationDetailView.as_view(),name='org-detail'),
]