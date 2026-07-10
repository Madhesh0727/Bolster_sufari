"""
Public API Views — Bookings (for React frontend)
"""
import logging
from rest_framework.decorators import api_view, permission_classes, authentication_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle
from django.shortcuts import get_object_or_404

from apps.bookings.models import Booking
from apps.bookings.serializers import BookingCreateSerializer, BookingDetailSerializer, CouponValidateSerializer
from apps.coupons.models import Coupon
from apps.notifications.services import notify_admins

logger = logging.getLogger('apps.bookings')


class CouponRateThrottle(AnonRateThrottle):
    """Limit anonymous coupon validation to 10 per minute per IP to prevent brute-forcing."""
    rate = '10/min'

@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def booking_create_api(request):
    """Create a booking and initialize Razorpay Order."""
    serializer = BookingCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        booking = serializer.save()

        # Initialize Razorpay Client
        from django.conf import settings
        import razorpay
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

        # Amount in paise (1 INR = 100 Paise)
        order_amount = int(booking.total_amount * 100)
        
        import time
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Create Razorpay Order
                razorpay_order = client.order.create({
                    'amount': order_amount,
                    'currency': 'INR',
                    'receipt': booking.booking_ref,
                    'payment_capture': '1'  # Auto-capture
                })
                
                # Save order ID
                booking.razorpay_order_id = razorpay_order['id']
                booking.save(update_fields=['razorpay_order_id'])

                logger.info(f'Razorpay Order created for booking: {booking.booking_ref}')
                
                return Response({
                    'booking_ref': booking.booking_ref,
                    'status': 'created',
                    'total_amount': str(booking.total_amount),
                    'razorpay_order_id': booking.razorpay_order_id,
                    'razorpay_key_id': settings.RAZORPAY_KEY_ID,
                    'customer_name': booking.customer_name,
                    'customer_email': booking.customer_email,
                    'customer_phone': booking.customer_phone,
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                logger.error(f"Razorpay order creation failed (attempt {attempt+1}): {str(e)}")
                if attempt == max_retries - 1:
                    return Response({'error': 'Failed to initialize payment gateway after multiple attempts.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                time.sleep(1)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def booking_verify_payment_api(request):
    """Verify Razorpay payment signature."""
    from django.conf import settings
    import razorpay
    from django.utils import timezone
    from apps.bookings.models import PaymentStatus

    data = request.data
    razorpay_payment_id = data.get('razorpay_payment_id')
    razorpay_order_id = data.get('razorpay_order_id')
    razorpay_signature = data.get('razorpay_signature')
    
    if not all([razorpay_payment_id, razorpay_order_id, razorpay_signature]):
        return Response({'error': 'Missing payment verification data.'}, status=status.HTTP_400_BAD_REQUEST)

    client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

    try:
        # Verify the signature
        client.utility.verify_payment_signature({
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        })
        
        # Get booking and update status
        booking = get_object_or_404(Booking, razorpay_order_id=razorpay_order_id)
        
        # Avoid duplicate verification
        if booking.payment_status == PaymentStatus.VERIFIED:
            return Response({'status': 'verified', 'booking_ref': booking.booking_ref})

        booking.razorpay_payment_id = razorpay_payment_id
        booking.razorpay_signature = razorpay_signature
        booking.payment_status = PaymentStatus.VERIFIED
        booking.verified_at = timezone.now()
        booking.save()

        # Send notification
        notify_admins.delay(
            notification_type='booking_confirmed',
            title=f'New Booking Verified: {booking.booking_ref}',
            message=f'Payment of ₹{booking.total_amount} received from {booking.customer_name}.',
            data={'booking_id': str(booking.id), 'booking_ref': booking.booking_ref}
        )

        logger.info(f'Payment verified for booking: {booking.booking_ref}')
        return Response({'status': 'verified', 'booking_ref': booking.booking_ref})

    except razorpay.errors.SignatureVerificationError:
        logger.error(f'Razorpay signature verification failed for order {razorpay_order_id}')
        return Response({'error': 'Payment verification failed.'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f'Payment verification error: {str(e)}')
        return Response({'error': 'An unexpected error occurred during verification.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def booking_detail_api(request, ref):
    """Get booking details by reference number.
    
    Security: Requires matching customer_email query param to prevent IDOR.
    Authenticated admin users can bypass the email check.
    """
    booking = get_object_or_404(
        Booking.objects.select_related('trip', 'trip__destination', 'trip_date').prefetch_related('additional_travelers'), 
        booking_ref=ref
    )
    
    # Allow authenticated superusers to view any booking freely
    if request.user and request.user.is_authenticated and request.user.is_superuser:
        return Response(BookingDetailSerializer(booking).data)
    
    # For public access: require email confirmation to prevent brute-force IDOR
    provided_email = request.query_params.get('email', '').strip().lower()
    if not provided_email:
        return Response(
            {'error': 'Please provide your email address to verify this booking (e.g. ?email=you@example.com).'},
            status=status.HTTP_400_BAD_REQUEST
        )
    if booking.customer_email.lower() != provided_email:
        return Response(
            {'error': 'Email address does not match booking records.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    return Response(BookingDetailSerializer(booking).data)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
@throttle_classes([CouponRateThrottle])
def coupon_validate_api(request):
    """Validate a coupon code and return the discount amount."""
    serializer = CouponValidateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    code = serializer.validated_data['code']
    amount = serializer.validated_data['amount']

    try:
        coupon = Coupon.objects.get(code__iexact=code)
        if coupon.is_valid:
            discount = coupon.calculate_discount(amount)
            return Response({
                'valid': True,
                'discount': float(discount),
                'new_total': float(amount - discount),
                'message': f'Coupon applied! You save ₹{discount:,.0f}',
            })
        return Response({'valid': False, 'error': 'Coupon expired or usage limit reached'})
    except Coupon.DoesNotExist:
        return Response({'valid': False, 'error': 'Invalid coupon code'})
