"""Bookings API URL patterns (React frontend)."""
from django.urls import path
from apps.bookings import api_views

urlpatterns = [
    path('create/', api_views.booking_create_api, name='api_booking_create'),
    path('verify/', api_views.booking_verify_payment_api, name='api_booking_verify'),
    path('coupon/validate/', api_views.coupon_validate_api, name='api_coupon_validate'),
    path('<str:ref>/', api_views.booking_detail_api, name='api_booking_detail'),
]
