from django.db import migrations
from django.contrib.auth.hashers import make_password

def create_superuser(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    # Use a highly unique email to avoid conflicts with existing users
    email = 'system_superadmin@bolstersafari.com'
    
    if not User.objects.filter(username='admin').exists() and not User.objects.filter(email=email).exists():
        User.objects.create(
            username='admin',
            email=email,
            password=make_password('Admin@12345'),
            is_staff=True,
            is_superuser=True,
            is_active=True
        )
    else:
        # If admin exists, ensure the password is set correctly
        User.objects.filter(username='admin').update(
            password=make_password('Admin@12345'),
            is_staff=True,
            is_superuser=True
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
