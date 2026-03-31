from django.db import models
from accounts.models import Organization, User


# Activity Log model
class ActivityLog(models.Model):
    ACTION_CHOICES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
    ]
    # Fields
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='activity_logs'
    )
    # Log organization for easier querying and multi-tenancy support
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='activity_logs'
    )
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=50)
    object_id = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    # String representation
    def __str__(self):
        return f"{self.user} - {self.action} - {self.model_name}"