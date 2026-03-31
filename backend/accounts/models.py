from django.contrib.auth.models import AbstractUser
from django.db import models


# company model
class Organization(models.Model):
    # Subscription plans
    PLAN_CHOICES = [
        ('basic', 'Basic'),
        ('pro', 'Pro'),
    ]
    # Fields
    name = models.CharField(max_length=255)
    subscription_plan = models.CharField(
        max_length=10,
        choices=PLAN_CHOICES,
        default='basic'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    # String representation
    def __str__(self):
        return self.name


# user model
class User(AbstractUser):
    # Role choices
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('staff', 'Staff'),
    ]
    # Fields
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE, # Delete users if organization is deleted
        related_name='users',
        null=True,
        blank=True
    )
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='staff'
    )

    # String representation
    def __str__(self):
        return f"{self.username} ({self.role})"