
from rest_framework.permissions import BasePermission


# role based permissions
class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        # Check if the logged in user has admin role
        return request.user.role == 'admin'


# role based permissions
class IsManagerOrAdmin(BasePermission):
    """
    Only admin or manager roles can pass.
    Used for editing records.
    """
    def has_permission(self, request, view):
        # Allow if user is admin OR manager
        return request.user.role in ['admin', 'manager']


# role based permissions
class IsStaffOrAbove(BasePermission):
    """
    All roles can pass (staff, manager, admin).
    Used for reading and creating records.
    """
    def has_permission(self, request, view):
        # Allow any authenticated user with a valid role
        return request.user.role in ['staff', 'manager', 'admin']


# tenant based permissions
class TenantPermission(BasePermission):
    """
    This is the most important permission.
    It makes sure a user can ONLY see data from their own organization.
    Example: User from Company A cannot see Company B's data.
    """
    def has_object_permission(self, request, view, obj):
        # Compare the object's organization with the user's organization
        return obj.organization == request.user.organization