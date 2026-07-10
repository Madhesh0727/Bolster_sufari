import os
import django
import sys

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bolstersafari.settings.development")
sys.path.insert(0, '/home/madhesh-rasu/Desktop/bolstersafari_django/bolstersafari_django')
django.setup()

from apps.trips.models import Trip
from apps.trips.serializers import TripCreateUpdateSerializer
from django.forms.models import model_to_dict

trip = Trip.objects.first()
if trip:
    print("Found trip:", trip.title)
    
    # Simulate PUT request from frontend (excluding some read_only)
    payload = {
        'title': trip.title + " (Edit)",
        'category': trip.category,
        'base_price': trip.base_price,
        'days': trip.days,
        'nights': trip.nights,
    }
    
    serializer = TripCreateUpdateSerializer(trip, data=payload, partial=True)
    if serializer.is_valid():
        print("Serializer is valid!")
    else:
        print("Serializer errors:", serializer.errors)
