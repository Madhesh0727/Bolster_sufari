"""
Trips Serializers — BolsterSafari Public API
"""
from rest_framework import serializers
from django.db import transaction
from apps.trips.models import Trip, Destination, TripDate
from apps.reviews.models import Review


class DestinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Destination
        fields = ['id', 'name', 'country', 'description', 'hero_image_url', 'is_featured']


class TripDateSerializer(serializers.ModelSerializer):
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    id = serializers.UUIDField(required=False, allow_null=True)
    end_date = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = TripDate
        fields = ['id', 'start_date', 'end_date', 'available_seats', 'effective_price', 'is_active']


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'reviewer_name', 'reviewer_avatar', 'rating', 'comment', 'created_at']


class TripMediaMixin(serializers.Serializer):
    cover_image = serializers.CharField(read_only=True)


class TripPricingMixin(serializers.Serializer):
    is_soldout = serializers.BooleanField(read_only=True)
    available_seats = serializers.IntegerField(read_only=True)


class TripReviewMixin(serializers.Serializer):
    reviews = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    def get_reviews(self, obj):
        published = obj.reviews.filter(is_published=True).order_by('-created_at')[:10]
        return ReviewSerializer(published, many=True).data

    def get_avg_rating(self, obj):
        from django.db.models import Avg
        result = obj.reviews.filter(is_published=True).aggregate(avg=Avg('rating'))['avg']
        return round(result, 1) if result else 0

    def get_review_count(self, obj):
        return obj.reviews.filter(is_published=True).count()


class TripListSerializer(TripMediaMixin, TripPricingMixin, serializers.ModelSerializer):
    destination_name = serializers.CharField(read_only=True)
    category_display = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = [
            'id', 'title', 'slug', 'destination_name', 'category', 'category_display',
            'description', 'days', 'nights', 'base_price', 'cover_image',
            'is_featured', 'is_soldout', 'available_seats', 'max_capacity',
            'highlights', 'created_at',
        ]

    def get_category_display(self, obj):
        return obj.get_category_display()


class TripDetailSerializer(TripMediaMixin, TripPricingMixin, TripReviewMixin, serializers.ModelSerializer):
    destination = DestinationSerializer(read_only=True)
    destination_name = serializers.CharField(read_only=True)
    dates = TripDateSerializer(many=True, read_only=True)
    related_trips = serializers.SerializerMethodField()
    category_display = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = [
            'id', 'title', 'slug', 'destination', 'destination_name',
            'category', 'category_display', 'description', 'days', 'nights',
            'base_price', 'cover_image', 'gallery', 'itinerary', 'highlights',
            'food_included', 'stay_details', 'max_capacity', 'available_seats',
            'is_featured', 'is_soldout', 'dates', 'reviews', 'avg_rating',
            'review_count', 'related_trips', 'created_at',
        ]

    def get_related_trips(self, obj):
        related = Trip.objects.filter(
            is_active=True, category=obj.category
        ).exclude(pk=obj.pk)[:3]
        return TripListSerializer(related, many=True).data

    def get_category_display(self, obj):
        return obj.get_category_display()


class TripCreateUpdateSerializer(serializers.ModelSerializer):
    dates = TripDateSerializer(many=True, required=False)
    
    # Accept UUID for destination
    destination_id = serializers.UUIDField(required=False, allow_null=True, write_only=True)
    agency_name = serializers.CharField(max_length=100, allow_blank=True, required=False)
    food_included = serializers.CharField(allow_blank=True, required=False)
    stay_details = serializers.CharField(allow_blank=True, required=False)

    class Meta:
        model = Trip
        fields = [
            'id', 'title', 'slug', 'destination_id', 'destination_text',
            'category', 'description', 'days', 'nights',
            'base_price', 'cover_image_url', 'gallery', 'itinerary', 'highlights',
            'food_included', 'stay_details', 'max_capacity',
            'is_featured', 'is_active', 'agency_name', 'dates'
        ]

    def create(self, validated_data):
        dates_data = validated_data.pop('dates', [])
        if 'destination_id' in validated_data:
            destination_id = validated_data.pop('destination_id')
            if destination_id:
                try:
                    validated_data['destination'] = Destination.objects.get(id=destination_id)
                except Destination.DoesNotExist:
                    validated_data['destination'] = None
            else:
                validated_data['destination'] = None

        with transaction.atomic():
            trip = Trip.objects.create(**validated_data)
            for date_data in dates_data:
                date_data.pop('id', None) # Remove id if any
                TripDate.objects.create(trip=trip, **date_data)
        return trip

    def update(self, instance, validated_data):
        dates_data = validated_data.pop('dates', None)
        
        if 'destination_id' in validated_data:
            destination_id = validated_data.pop('destination_id')
            if destination_id:
                try:
                    instance.destination = Destination.objects.get(id=destination_id)
                except Destination.DoesNotExist:
                    instance.destination = None
            else:
                instance.destination = None
        
        with transaction.atomic():
            # Update trip fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
    
            # Update dates if provided
            if dates_data is not None:
                keep_dates = []
                for date_data in dates_data:
                    date_id = date_data.get('id', None)
                    if date_id:
                        try:
                            date_obj = TripDate.objects.get(id=date_id, trip=instance)
                            for attr, value in date_data.items():
                                # Don't update id
                                if attr != 'id':
                                    setattr(date_obj, attr, value)
                            date_obj.save()
                            keep_dates.append(date_obj.id)
                        except TripDate.DoesNotExist:
                            date_data.pop('id', None)
                            new_date = TripDate.objects.create(trip=instance, **date_data)
                            keep_dates.append(new_date.id)
                    else:
                        date_data.pop('id', None)
                        new_date = TripDate.objects.create(trip=instance, **date_data)
                        keep_dates.append(new_date.id)
                
                # Delete removed dates
                instance.dates.exclude(id__in=keep_dates).delete()
            
            
        return instance

