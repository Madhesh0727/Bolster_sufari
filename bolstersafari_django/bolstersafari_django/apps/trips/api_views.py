"""
Public API Views — Trips (for React frontend)
"""
from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Q
from django.views.decorators.cache import cache_page

from apps.trips.models import Trip, Destination, TripCategory
from apps.trips.serializers import TripListSerializer, TripDetailSerializer, DestinationSerializer
from django.utils.decorators import method_decorator
class TripListAPIView(generics.ListAPIView):
    serializer_class = TripListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Trip.objects.filter(is_active=True).select_related('destination').prefetch_related('dates')
        category = self.request.query_params.get('category', '')
        search = self.request.query_params.get('q', '')
        featured = self.request.query_params.get('featured', '')

        if category:
            qs = qs.filter(category=category)
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(destination_text__icontains=search) |
                Q(destination__name__icontains=search)
            )
        if featured == '1':
            qs = qs.filter(is_featured=True)

        return qs.order_by('-is_featured', '-created_at')


class TripDetailAPIView(generics.RetrieveAPIView):
    serializer_class = TripDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        return Trip.objects.filter(is_active=True).select_related('destination').prefetch_related('dates', 'reviews')


class DestinationListAPIView(generics.ListAPIView):
    serializer_class = DestinationSerializer
    permission_classes = [AllowAny]
    queryset = Destination.objects.all().order_by('name')


@api_view(['GET'])
@permission_classes([AllowAny])
@cache_page(60 * 15)
def trip_categories_view(request):
    return Response([
        {'value': value, 'label': label}
        for value, label in TripCategory.choices
    ])


@api_view(['GET'])
@permission_classes([AllowAny])
@cache_page(60 * 15)
def public_settings_view(request):
    import os
    from apps.notifications.models import SiteSetting
    from apps.media_gallery.models import MediaItem

    settings_qs = SiteSetting.objects.all()
    settings = {s.key: s.value for s in settings_qs}


    qr_image = ''

    gallery = MediaItem.objects.filter(media_type='image').order_by('sort_order')[:12]
    gallery_data = [{'id': str(g.id), 'url': g.media_url, 'title': g.title} for g in gallery]

    # Dynamically fetch from Admin (SiteSetting) OR Render Environment Variables OR Defaults
    return Response({
        'site_name': settings.get('site_name', '') or os.environ.get('SITE_NAME', 'Bolster Safari'),
        'site_logo': settings.get('site_logo', ''),
        'phone': settings.get('phone', '') or os.environ.get('CONTACT_PHONE', '+91 9876543210'),
        'email': settings.get('email', '') or os.environ.get('CONTACT_EMAIL', 'hello@bolstersafari.com'),
        'address': settings.get('address', '') or os.environ.get('CONTACT_ADDRESS', '123 Adventure Lane, Wildlife City'),
        'upi_id': settings.get('upi_id', ''),
        'qr_image': qr_image or settings.get('qr_image_url', ''),
        'happy_travelers': settings.get('happy_travelers', '1200'),
        'footer_description': settings.get('footer_description', 'Experience the adventure of a lifetime with our carefully curated safari and travel packages.'),
        'gallery': gallery_data,
    })

