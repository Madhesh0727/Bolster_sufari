from rest_framework import generics, permissions, parsers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Sum
from django.conf import settings
from django.core.files.storage import default_storage

from apps.trips.models import Trip
from apps.bookings.models import Booking
from apps.accounts.models import User
from apps.trips.serializers import TripDetailSerializer, TripCreateUpdateSerializer
from apps.bookings.serializers import BookingDetailSerializer
from apps.accounts.serializers import UserSerializer

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)

class DashboardStatsAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        total_users = User.objects.count()
        total_trips = Trip.objects.count()
        active_trips = Trip.objects.filter(is_active=True).count()
        
        bookings = Booking.objects.all()
        total_bookings = bookings.count()
        verified_bookings = bookings.filter(payment_status='verified')
        total_revenue = verified_bookings.aggregate(Sum('total_amount'))['total_amount__sum'] or 0

        recent_bookings = BookingDetailSerializer(bookings.order_by('-created_at')[:5], many=True).data

        return Response({
            'users': total_users,
            'trips': {'total': total_trips, 'active': active_trips},
            'bookings': total_bookings,
            'revenue': float(total_revenue),
            'recent_bookings': recent_bookings,
        })

class AdminMediaUploadAPIView(APIView):
    permission_classes = [IsSuperAdmin]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=400)
        
        from django.core.files.base import ContentFile
        file_name = default_storage.save(f'uploads/{file_obj.name}', ContentFile(file_obj.read()))
        # Use storage backend's url() — works for both local and Supabase storage
        file_url = default_storage.url(file_name)
        # If local dev (relative URL), make it absolute
        if file_url.startswith('/'):
            file_url = request.build_absolute_uri(file_url)
        
        return Response({'url': file_url})

class AdminTripListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsSuperAdmin]
    queryset = Trip.objects.all().order_by('-created_at')
    
    def get_serializer_class(self):
        if self.request.method in ['POST', 'PUT', 'PATCH']:
            return TripCreateUpdateSerializer
        return TripDetailSerializer

class AdminTripDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsSuperAdmin]
    queryset = Trip.objects.all()
    
    def get_serializer_class(self):
        if self.request.method in ['POST', 'PUT', 'PATCH']:
            return TripCreateUpdateSerializer
        return TripDetailSerializer

class AdminBookingListAPIView(generics.ListAPIView):
    permission_classes = [IsSuperAdmin]
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingDetailSerializer

class AdminBookingDetailAPIView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsSuperAdmin]
    queryset = Booking.objects.all()
    serializer_class = BookingDetailSerializer

class AdminUserListAPIView(generics.ListAPIView):
    permission_classes = [IsSuperAdmin]
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer

class AdminUserDetailAPIView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsSuperAdmin]
    queryset = User.objects.all()
    serializer_class = UserSerializer

class AdminUserBanAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            # Cannot ban superusers
            if user.is_superuser:
                return Response({'error': 'Cannot ban a superuser'}, status=400)
                
            user.is_active = not user.is_active
            user.save()
            return Response({'status': 'success', 'is_active': user.is_active})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)




# ─── Blog Management ─────────────────────────────────────────────────────────
from apps.media_gallery.models import BlogPost
from rest_framework import serializers as drf_serializers


class BlogPostAdminSerializer(drf_serializers.ModelSerializer):
    author_name = drf_serializers.SerializerMethodField()
    cover_image = drf_serializers.ImageField(required=False, allow_null=True)
    thumbnail = drf_serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'cover_image_url', 'cover_image', 'thumbnail',
            'youtube_embed_code', 'excerpt', 'content',
            'tags', 'status', 'published_at', 'created_at', 'author_name',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'author_name']

    def get_author_name(self, obj):
        return obj.author.display_name if obj.author else 'Bolster Safari'

    def get_thumbnail(self, obj):
        request = self.context.get('request')
        if obj.cover_image:
            url = obj.cover_image.url
            return request.build_absolute_uri(url) if request else url
        return obj.cover_image_url or ''


class AdminBlogListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsSuperAdmin]
    queryset = BlogPost.objects.all().order_by('-created_at')
    serializer_class = BlogPostAdminSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def perform_create(self, serializer):
        from django.utils import timezone
        status = serializer.validated_data.get('status', 'draft')
        pub_at = timezone.now() if status == 'published' else None
        serializer.save(author=self.request.user, published_at=pub_at)


class AdminBlogDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsSuperAdmin]
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostAdminSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def perform_update(self, serializer):
        from django.utils import timezone
        instance = serializer.instance
        new_status = serializer.validated_data.get('status', instance.status)
        pub_at = instance.published_at
        if new_status == 'published' and not pub_at:
            pub_at = timezone.now()
        serializer.save(published_at=pub_at)


# ─── Coupon Management ───────────────────────────────────────────────────────
from apps.coupons.models import Coupon


class CouponAdminSerializer(drf_serializers.ModelSerializer):
    is_valid = drf_serializers.BooleanField(read_only=True)

    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'description', 'discount_type', 'discount_value',
            'min_amount', 'max_discount', 'max_uses', 'used_count',
            'valid_from', 'valid_until', 'is_active', 'is_valid', 'created_at',
        ]
        read_only_fields = ['id', 'used_count', 'created_at', 'is_valid']


class AdminCouponListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsSuperAdmin]
    queryset = Coupon.objects.all().order_by('-created_at')
    serializer_class = CouponAdminSerializer


class AdminCouponDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsSuperAdmin]
    queryset = Coupon.objects.all()
    serializer_class = CouponAdminSerializer

class AdminCouponAIGenerateAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request, *args, **kwargs):
        valid_until = request.data.get('valid_until')
        if not valid_until:
            return Response({'error': 'valid_until is required'}, status=400)

        try:
            import secrets
            import string
            
            # Generate random code
            prefix = secrets.choice(['SUMMER', 'WINTER', 'FESTIVE', 'FLASH', 'MEGA', 'WILD', 'SAFARI', 'BONUS'])
            suffix = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(4))
            code = f"{prefix}{suffix}"
            
            # Generate random discount
            discount_type = secrets.choice(['percent', 'flat'])
            if discount_type == 'percent':
                discount_value = secrets.choice([5, 10, 15, 20, 25])
                description = f"{discount_value}% off {prefix.lower()} special!"
            else:
                discount_value = secrets.choice([500, 1000, 1500, 2000, 2500])
                description = f"₹{discount_value} off {prefix.lower()} special!"
            
            # Parse valid_until
            from django.utils.dateparse import parse_datetime
            if isinstance(valid_until, str):
                valid_until = parse_datetime(valid_until)
            
            # Create the coupon
            coupon = Coupon.objects.create(
                code=code,
                description=description,
                discount_type=discount_type,
                discount_value=discount_value,
                valid_until=valid_until,
                is_active=True
            )
            
            serializer = CouponAdminSerializer(coupon)
            return Response(serializer.data, status=201)
        except Exception as e:
            import logging
            logger = logging.getLogger('apps.core')
            logger.error(f'Coupon auto-generation error: {e}', exc_info=True)
            return Response({'error': 'Unable to auto-generate coupon at this time.'}, status=500)


class AdminResetDatabaseAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        from apps.bookings.models import Booking, AdditionalTraveler
        from apps.reviews.models import Review
        from apps.wishlist.models import Wishlist
        from apps.core.models import ForensicLog
        from apps.accounts.models import User
        
        # Security measure to prevent accidental execution without confirmation
        confirm = request.data.get('confirm')
        if confirm != 'RESET':
            return Response({'error': 'Confirmation string "RESET" required'}, status=400)
            
        try:
            Booking.objects.all().delete()
            AdditionalTraveler.objects.all().delete()
            Review.objects.all().delete()
            Wishlist.objects.all().delete()
            ForensicLog.objects.all().delete()
            
            # Delete non-superusers
            User.objects.filter(is_superuser=False).delete()
            
            return Response({'message': 'Test database successfully reset.'})
        except Exception as e:
            import logging
            logger = logging.getLogger('apps.core')
            logger.error(f'Database reset error: {e}', exc_info=True)
            return Response({'error': 'Failed to reset database.'}, status=500)
