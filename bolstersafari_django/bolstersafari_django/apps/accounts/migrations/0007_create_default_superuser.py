from django.db import migrations
from django.contrib.auth.hashers import make_password

import os

def create_superuser(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    if not User.objects.filter(username='admin').exists():
        password = os.environ.get('ADMIN_PASSWORD', 'fallback_secure_123')
        User.objects.create(
            username='admin',
            email='admin@bolstersafari.com',
            is_staff=True,
            is_superuser=True,
            is_active=True,
            password=make_password(password),
        )
    if not User.objects.filter(email='madhesh@example.com').exists():
        password = os.environ.get('ADMIN_PASSWORD', 'fallback_secure_123')
        User.objects.create(
            username='madhesh',
            email='madhesh@example.com',
            is_staff=True,
            is_superuser=True,
            is_active=True,
            password=make_password(password),
        )

def remove_superuser(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    User.objects.filter(username='admin').delete()

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0006_remove_kycrequest_created_user_and_more'),
    ]

    operations = [
        migrations.RunPython(create_superuser, remove_superuser),
    ]
