"""Reviews API URL patterns."""
from django.urls import path
from apps.reviews import api_views

urlpatterns = [
    path('<slug:slug>/', api_views.ReviewListAPIView.as_view(), name='review_list'),
    path('submit/', api_views.ReviewCreateAPIView.as_view(), name='review_create'),
]
