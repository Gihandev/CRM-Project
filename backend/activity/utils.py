

from .models import ActivityLog


def log_activity(user, action, model_name, object_id):
    """
    Creates one activity log record.
    
    Parameters:
    - user       : the logged in user doing the action
    - action     : 'CREATE', 'UPDATE', or 'DELETE'
    - model_name : which model was affected e.g. 'Company' or 'Contact'
    - object_id  : the ID number of the affected record
    
    Example usage:
    log_activity(request.user, 'CREATE', 'Company', company.id)
    """
    ActivityLog.objects.create(
        user=user,
        organization=user.organization,  # automatically gets the user's org
        action=action,
        model_name=model_name,
        object_id=object_id
    )