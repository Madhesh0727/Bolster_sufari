"""Public URL patterns for trips API (React frontend)."""
from django.urls import path
from apps.trips import api_views

urlpatterns = [
    path('', api_views.TripListAPIView.as_view(), name='api_trip_list'),
    path('categories/', api_views.trip_categories_view, name='api_trip_categories'),
    path('destinations/', api_views.DestinationListAPIView.as_view(), name='api_destination_list'),
    path('<slug:slug>/', api_views.TripDetailAPIView.as_view(), name='api_trip_detail'),
]
