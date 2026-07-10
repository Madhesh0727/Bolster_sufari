"""
Bookings Serializers — BolsterSafari Public API
"""
from decimal import Decimal
from rest_framework import serializers
from django.db import transaction
from apps.bookings.models import Booking, AdditionalTraveler


class AdditionalTravelerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdditionalTraveler
        fields = ['name', 'aadhar', 'dob', 'age']


class BookingCreateSerializer(serializers.Serializer):
    trip_slug = serializers.SlugField()
    trip_date_id = serializers.UUIDField(required=False, allow_null=True)
    customer_name = serializers.CharField(max_length=150)
    customer_email = serializers.EmailField()
    customer_phone = serializers.CharField(max_length=20)
    customer_whatsapp = serializers.CharField(max_length=20, required=False, allow_blank=True)
    customer_age = serializers.IntegerField(required=False, allow_null=True)
    customer_aadhar = serializers.CharField(max_length=20)
    customer_dob = serializers.DateField()
    number_of_people = serializers.IntegerField(min_value=1, max_value=50)
    additional_travelers = AdditionalTravelerSerializer(many=True, required=False)
    coupon_code = serializers.CharField(max_length=50, required=False, allow_blank=True)

    referral_code = serializers.CharField(max_length=64, required=False, allow_blank=True)

    def validate_trip_slug(self, value):
        from apps.trips.models import Trip
        try:
            trip = Trip.objects.get(slug=value, is_active=True)
            self.context['trip'] = trip
        except Trip.DoesNotExist:
            raise serializers.ValidationError('Trip not found or not available.')
        return value

    def validate(self, data):
        from apps.trips.models import TripDate
        trip = self.context.get('trip')
        people = data.get('number_of_people', 1)
        
        trip_date_id = data.get('trip_date_id')
        if trip_date_id:
            try:
                trip_date = TripDate.objects.get(pk=trip_date_id, trip=trip)
                if trip_date.available_seats < people:
                    raise serializers.ValidationError(f"Only {trip_date.available_seats} seats remaining for this date.")
            except TripDate.DoesNotExist:
                raise serializers.ValidationError("Selected date is invalid.")
        else:
            if trip and trip.available_seats < people:
                raise serializers.ValidationError(f"Only {trip.available_seats} seats remaining.")

        if people > 1:
            additional_travelers = data.get('additional_travelers', [])
            if len(additional_travelers) != people - 1:
                raise serializers.ValidationError(f"Expected {people - 1} additional traveler(s).")

        return data

    def create(self, validated_data):
        from apps.trips.models import Trip, TripDate
        from apps.coupons.models import Coupon
        from apps.accounts.models import User
        from django.db.models import F

        trip = self.context['trip']
        people = validated_data['number_of_people']
        margin = 0.0
        ref_user = None
        referral_code = validated_data.get('referral_code', '')
        if referral_code:
            try:
                # unique_code was removed in migration 0006; look up by username
                ref_user = User.objects.get(username=referral_code, is_active=True)
            except User.DoesNotExist:
                import logging
                logging.getLogger(__name__).warning(f"Invalid referral code provided: {referral_code}")

        effective_price = float(trip.base_price) + margin
        coupon = None
        coupon_discount = 0.0
        coupon_code = validated_data.get('coupon_code', '')
        customer_email = validated_data['customer_email']

        if coupon_code:
            try:
                coupon = Coupon.objects.get(code__iexact=coupon_code)
                if coupon.is_valid:
                    # Per-email coupon reuse check: prevent same email using one-time coupons multiple times
                    if coupon.max_uses == 1 and Booking.objects.filter(
                        coupon=coupon, customer_email__iexact=customer_email
                    ).exists():
                        raise serializers.ValidationError(
                            f'Coupon "{coupon_code}" has already been used by this email address.'
                        )
                    coupon_discount = float(coupon.calculate_discount(effective_price * people))
            except Coupon.DoesNotExist:
                import logging
                logging.getLogger(__name__).warning(f"Invalid coupon code provided: {coupon_code}")

        total = (effective_price * people) - coupon_discount

        # Use atomic transaction + select_for_update to prevent race conditions on seat availability
        with transaction.atomic():
            trip_date = None
            if validated_data.get('trip_date_id'):
                try:
                    # select_for_update locks this row until end of transaction
                    trip_date = TripDate.objects.select_for_update().get(
                        pk=validated_data['trip_date_id'], trip=trip
                    )
                    if trip_date.available_seats < people:
                        raise serializers.ValidationError(
                            f'Only {trip_date.available_seats} seat(s) remaining for this date.'
                        )
                except TripDate.DoesNotExist:
                    raise serializers.ValidationError('Selected date is no longer available.')

            booking = Booking.objects.create(
                trip=trip,
                trip_date=trip_date,
                customer_name=validated_data['customer_name'],
                customer_email=customer_email,
                customer_phone=validated_data['customer_phone'],
                customer_whatsapp=validated_data.get('customer_whatsapp', ''),
                customer_age=validated_data.get('customer_age', None),
                customer_aadhar=validated_data['customer_aadhar'],
                customer_dob=validated_data['customer_dob'],
                number_of_people=people,
                base_amount=Decimal(str(float(trip.base_price) * people)),
                margin_amount=Decimal(str(margin * people)),
                coupon=coupon,
                coupon_discount=Decimal(str(coupon_discount)),
                total_amount=Decimal(str(total)),
                referred_by=ref_user,
            )

            # Reserve seats (inside atomic block)
            Trip.objects.filter(pk=trip.pk).update(current_bookings=F('current_bookings') + people)
            if trip_date:
                TripDate.objects.filter(pk=trip_date.pk).update(available_seats=F('available_seats') - people)

            if coupon:
                Coupon.objects.filter(pk=coupon.pk).update(used_count=F('used_count') + 1)

            # Save additional travelers
            additional_travelers_data = validated_data.get('additional_travelers', [])
            for traveler_data in additional_travelers_data:
                AdditionalTraveler.objects.create(booking=booking, **traveler_data)

        return booking


class BookingDetailSerializer(serializers.ModelSerializer):
    trip_title = serializers.CharField(source='trip.title', read_only=True)
    trip_slug = serializers.CharField(source='trip.slug', read_only=True)
    destinations = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    travel_modes = serializers.SerializerMethodField()
    agency_name = serializers.SerializerMethodField()
    additional_travelers = AdditionalTravelerSerializer(many=True, read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_ref', 'trip_title', 'trip_slug', 'customer_name',
            'customer_email', 'customer_phone', 'customer_age', 'customer_aadhar', 'customer_dob', 'number_of_people',
            'additional_travelers',
            'base_amount', 'coupon_discount', 'total_amount',
            'payment_status', 'created_at', 'destinations', 'date', 'travel_modes', 'agency_name'
        ]

    def get_destinations(self, obj):
        return obj.trip.destination_name if obj.trip else 'VARIOUS'

    def get_date(self, obj):
        if obj.trip_date:
            start = obj.trip_date.start_date.strftime('%B %d, %Y')
            if obj.trip_date.end_date:
                return f"{start} - {obj.trip_date.end_date.strftime('%B %d, %Y')}"
            return start
        return 'TBD / OPEN SCHEDULE'

    def get_travel_modes(self, obj):
        return obj.trip.get_category_display().upper() if obj.trip else 'EXPEDITION'

    def get_agency_name(self, obj):
        return obj.trip.agency_name.upper() if obj.trip else 'BOLSTER SAFARI'


class CouponValidateSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal('0.00'))
