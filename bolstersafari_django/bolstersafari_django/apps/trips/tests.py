from django.test import TestCase

from rest_framework.test import APIClient
from decimal import Decimal
from apps.trips.models import Trip, Destination, TripCategory

class TripModelTests(TestCase):
    def setUp(self):
        self.destination = Destination.objects.create(
            name="Munnar",
            country="India",
            description="Tea gardens"
        )
        self.trip = Trip.objects.create(
            title="Munnar Weekend",
            destination=self.destination,
            category=TripCategory.GROUP,
            days=3,
            nights=2,
            base_price=Decimal('5000.00'),
            max_capacity=20,
            is_active=True
        )

    def test_trip_creation(self):
        self.assertEqual(self.trip.title, "Munnar Weekend")
        self.assertEqual(self.trip.slug, "munnar-weekend")
        self.assertEqual(self.trip.destination_name, "Munnar")

    def test_available_seats(self):
        self.assertEqual(self.trip.available_seats, 20)
        self.trip.current_bookings = 5
        self.trip.save()
        self.assertEqual(self.trip.available_seats, 15)

    def test_is_soldout(self):
        self.assertFalse(self.trip.is_soldout)
        self.trip.current_bookings = 20
        self.trip.save()
        self.assertTrue(self.trip.is_soldout)

class TripAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.destination = Destination.objects.create(name="Goa", country="India")
        self.trip = Trip.objects.create(
            title="Goa Party",
            destination=self.destination,
            category=TripCategory.ADVENTURE,
            days=4,
            nights=3,
            base_price=Decimal('10000.00'),
            max_capacity=10,
            is_active=True
        )

    def test_get_trip_list(self):
        response = self.client.get('/api/trips/')
        self.assertEqual(response.status_code, 200)
        data = response.data.get('results', response.data) if isinstance(response.data, dict) else response.data
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], "Goa Party")

    def test_get_trip_detail(self):
        response = self.client.get(f'/api/trips/{self.trip.slug}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['title'], "Goa Party")

    def test_get_categories(self):
        response = self.client.get('/api/trips/categories/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data) > 0)
