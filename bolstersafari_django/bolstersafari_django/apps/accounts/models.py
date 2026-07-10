"""
Accounts Models — BolsterSafari
Custom User, KYC, WhatsApp Groups
"""
import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class UserRole(models.TextChoices):
    ADMIN = 'admin', _('Admin')
    CUSTOMER = 'customer', _('Customer')

class User(AbstractUser):
    """Extended user model with role-based access control."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_('email address'), unique=True)
    full_name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    whatsapp = models.CharField(max_length=20, blank=True)
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.CUSTOMER
    )
    avatar_url = models.URLField(max_length=500, blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # REMOVED: raw_password (SECURITY FIX)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    class Meta:
        db_table = 'bs_users'
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.full_name or self.username} ({self.role})"

    @property
    def display_name(self):
        return self.full_name or self.username

    @property
    def is_admin(self):
        return self.role == UserRole.ADMIN or self.is_superuser


class WhatsAppGroup(models.Model):
    """WhatsApp group links for customers."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group_link = models.URLField(max_length=500)
    description = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bs_whatsapp_groups'

    def __str__(self):
        return f"WhatsApp: {self.group_link[:40]}"

