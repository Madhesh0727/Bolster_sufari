import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bolstersafari.settings.development')
django.setup()

from django.test import Client
from apps.accounts.models import User
from apps.trips.models import Trip

def test_apis():
    client = Client()
    print("Testing Public APIs...")
    
    endpoints = [
        '/api/trips/',
        '/api/blog/',
        '/api/reviews/',
        '/api/settings/public/',
    ]
    
    for url in endpoints:
        res = client.get(url)
        print(f"GET {url} -> {res.status_code}")
        if res.status_code == 500:
            print(f"Error on {url}: {res.content}")

    # Admin APIs (Need superuser)
    try:
        admin_user = User.objects.get(username='admin')
        client.force_login(admin_user)
        print("\nTesting Admin APIs...")
        
        admin_endpoints = [
            '/api/admin/stats/',
            '/api/admin/trips/',
            '/api/admin/users/',
            '/api/admin/bookings/',
            '/api/admin/coupons/',
            '/api/admin/blog/',
        ]
        
        for url in admin_endpoints:
            res = client.get(url)
            print(f"GET {url} -> {res.status_code}")
            if res.status_code == 500:
                print(f"Error on {url}: {res.content}")
                
    except User.DoesNotExist:
        print("Admin user not found, skipping admin API tests.")

if __name__ == '__main__':
    test_apis()
