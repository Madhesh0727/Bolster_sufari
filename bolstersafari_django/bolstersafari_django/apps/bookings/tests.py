from django.test import TestCase

from rest_framework.test import APIClient
from decimal import Decimal
from apps.trips.models import Trip, Destination, TripCategory

from apps.coupons.models import Coupon

class BookingAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.destination = Destination.objects.create(name="Bali", country="Indonesia")
        self.trip = Trip.objects.create(
            title="Bali Retreat",
            destination=self.destination,
            category=TripCategory.BEACH,
            days=5,
            nights=4,
            base_price=Decimal('15000.00'),
            max_capacity=10,
            is_active=True
        )
        self.coupon = Coupon.objects.create(
            code="BALI500",
            discount_type="flat",
            discount_value=Decimal('500.00'),
            is_active=True
        )

    def test_booking_create_validation(self):
        # Missing required fields
        response = self.client.post('/api/bookings/create/', {
            "trip_slug": self.trip.slug,
            "number_of_people": 2
        }, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('customer_name', response.data)
        self.assertIn('customer_email', response.data)

    def test_coupon_validation(self):
        response = self.client.post('/api/bookings/coupon/validate/', {
            "code": "BALI500",
            "amount": 30000.0
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['valid'])
        self.assertEqual(response.data['discount'], 500.0)

    def test_invalid_coupon(self):
        response = self.client.post('/api/bookings/coupon/validate/', {
            "code": "INVALID",
            "amount": 30000.0
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data['valid'])
