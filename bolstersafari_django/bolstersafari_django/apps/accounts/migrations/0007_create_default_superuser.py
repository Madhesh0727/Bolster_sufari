from django.db import migrations
from django.contrib.auth.hashers import make_password

def create_superuser(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    if not User.objects.filter(username='admin').exists():
        User.objects.create(
            username='admin',
            email='admin@bolstersafari.com',
            password=make_password('Admin@12345'),
            is_staff=True,
            is_superuser=True,
            is_active=True
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
