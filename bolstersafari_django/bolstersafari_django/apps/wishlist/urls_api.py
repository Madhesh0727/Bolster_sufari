"""Wishlist API URL patterns."""
from django.urls import path
from apps.wishlist import api_views

urlpatterns = [
    path('', api_views.WishlistAPIView.as_view(), name='wishlist_list'),
    path('toggle/', api_views.WishlistToggleAPIView.as_view(), name='wishlist_toggle'),
]
