from django.test import TestCase

from rest_framework.test import APIClient
from apps.accounts.models import User

class AccountsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword123',
            email='test@example.com',
            full_name='Test User',
            phone='1234567890'
        )

    def test_login_success(self):
        response = self.client.post('/api/accounts/token/', {
            'username': 'testuser',
            'password': 'testpassword123'
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_failure(self):
        response = self.client.post('/api/accounts/token/', {
            'username': 'testuser',
            'password': 'wrongpassword'
        }, format='json')
        self.assertEqual(response.status_code, 401)

    def test_me_endpoint_unauthenticated(self):
        response = self.client.get('/api/accounts/me/')
        self.assertEqual(response.status_code, 401)

    def test_me_endpoint_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/accounts/me/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')
