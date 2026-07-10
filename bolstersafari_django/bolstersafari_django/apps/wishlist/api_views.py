"""Wishlist API Views — BolsterSafari"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.wishlist.models import Wishlist
from apps.trips.models import Trip


class WishlistAPIView(APIView):
    """
    GET  /api/wishlist/          — List all wishlisted trip slugs for the current user.
    POST /api/wishlist/toggle/   — Toggle (add or remove) a trip from the wishlist.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        trip_slugs = list(
            Wishlist.objects.filter(user=request.user)
            .values_list('trip__slug', flat=True)
        )
        return Response({'wishlisted_slugs': trip_slugs})


class WishlistToggleAPIView(APIView):
    """Toggle a trip in/out of the user's wishlist. Returns new state."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        trip_slug = request.data.get('trip_slug')
        if not trip_slug:
            return Response({'error': 'trip_slug is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            trip = Trip.objects.get(slug=trip_slug, is_active=True)
        except Trip.DoesNotExist:
            return Response({'error': 'Trip not found.'}, status=status.HTTP_404_NOT_FOUND)

        wishlist_item, created = Wishlist.objects.get_or_create(user=request.user, trip=trip)
        if not created:
            # Already wishlisted — remove it (toggle off)
            wishlist_item.delete()
            return Response({'wishlisted': False, 'message': 'Removed from wishlist.'})

        return Response({'wishlisted': True, 'message': 'Added to wishlist.'}, status=status.HTTP_201_CREATED)
