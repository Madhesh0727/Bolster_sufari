from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.accounts.serializers import CurrentUserSerializer, CustomTokenObtainPairSerializer, AdminTokenObtainPairSerializer
from rest_framework import generics
from rest_framework_simplejwt.views import TokenObtainPairView

class CurrentUserAPIView(generics.RetrieveUpdateAPIView):
    """
    Get or update the current user's profile.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CurrentUserSerializer

    def get_object(self):
        return self.request.user



from rest_framework.throttling import AnonRateThrottle, UserRateThrottle

class CustomTokenObtainPairView(TokenObtainPairView):
    """Customer login — no staff requirement."""
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [AnonRateThrottle]


class AdminTokenObtainPairView(TokenObtainPairView):
    """Admin panel login — requires is_staff=True."""
    serializer_class = AdminTokenObtainPairSerializer
    throttle_classes = [AnonRateThrottle]


class CustomerDashboardAPIView(APIView):
    """
    Get customer dashboard data: upcoming bookings, past bookings, wishlist.
    Authentication required. Bookings matched by user email.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.bookings.models import Booking
        from apps.bookings.serializers import BookingDetailSerializer
        from apps.wishlist.models import Wishlist
        from apps.trips.serializers import TripListSerializer
        from django.utils import timezone

        now = timezone.now().date()
        bookings = Booking.objects.filter(
            customer_email__iexact=request.user.email
        ).order_by('-created_at').select_related('trip', 'trip_date')

        upcoming, past = [], []
        for booking in bookings:
            data = BookingDetailSerializer(booking).data
            if booking.trip_date and booking.trip_date.start_date < now:
                past.append(data)
            else:
                upcoming.append(data)

        wishlist_trips = [w.trip for w in Wishlist.objects.filter(user=request.user).select_related('trip')]
        wishlist_data = TripListSerializer(wishlist_trips, many=True).data

        return Response({
            'user': CurrentUserSerializer(request.user).data,
            'bookings': {'upcoming': upcoming, 'past': past},
            'wishlist': wishlist_data,
        })


class CustomerRegistrationAPIView(APIView):
    """
    Public endpoint to register a new customer account.
    """
    permission_classes = []

    def post(self, request):
        from apps.accounts.models import User, UserRole
        from django.contrib.auth.hashers import make_password
        
        data = request.data
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name', '')
        phone = data.get('phone', '')
        
        if not username or not email or not password:
            return Response({'error': 'Username, email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)
            
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)
            
        User.objects.create(
            username=username,
            email=email,
            password=make_password(password),
            full_name=full_name,
            phone=phone,
            role=UserRole.CUSTOMER,
            is_active=True
        )
        
        return Response({'message': 'Registration successful'}, status=status.HTTP_201_CREATED)


class ChangePasswordAPIView(APIView):
    """
    Endpoint for changing user password.
    """
    permission_classes = [IsAuthenticated]
    throttle_classes = [UserRateThrottle]

    def post(self, request):
        from apps.accounts.serializers import ChangePasswordSerializer
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if user.check_password(serializer.data.get("old_password")):
                user.set_password(serializer.data.get("new_password"))
                user.save()
                return Response({'message': 'Password changed successfully.'}, status=status.HTTP_200_OK)
            return Response({'error': 'Incorrect old password.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
