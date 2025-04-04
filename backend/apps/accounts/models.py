# backend/apps/accounts/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """Custom user model with additional fields for role-based permissions"""
    ROLES = (
        ('accountant', 'Comptable'),
        ('admin', 'Administrateur'),
        ('financial_director', 'Directeur Financier'),
    )
    
    role = models.CharField(max_length=20, choices=ROLES, default='accountant')
    profile_image = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.username


# backend/apps/invoices/models.py





