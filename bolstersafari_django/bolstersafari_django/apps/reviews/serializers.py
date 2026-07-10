"""Reviews Serializers — BolsterSafari"""
from rest_framework import serializers
from apps.reviews.models import Review


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_display_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id', 'reviewer_name', 'reviewer_avatar', 'reviewer_display_name',
            'rating', 'comment', 'is_verified', 'created_at',
        ]
        read_only_fields = ['id', 'is_verified', 'created_at', 'reviewer_name', 'reviewer_avatar', 'reviewer_display_name']

    def get_reviewer_display_name(self, obj):
        return obj.reviewer_name or 'Anonymous'


class ReviewCreateSerializer(serializers.Serializer):
    trip_slug = serializers.SlugField()
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(max_length=2000, required=False, allow_blank=True)

    def validate_trip_slug(self, value):
        from apps.trips.models import Trip
        try:
            trip = Trip.objects.get(slug=value, is_active=True)
            self.context['trip'] = trip
        except Trip.DoesNotExist:
            raise serializers.ValidationError('Trip not found.')
        return value

    def validate(self, data):
        user = self.context['request'].user
        trip = self.context.get('trip')
        if trip and Review.objects.filter(trip=trip, user=user).exists():
            raise serializers.ValidationError('You have already submitted a review for this trip.')
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        trip = self.context['trip']
        return Review.objects.create(
            trip=trip,
            user=user,
            reviewer_name=user.display_name,
            reviewer_avatar=user.avatar_url or '',
            rating=validated_data['rating'],
            comment=validated_data.get('comment', ''),
            is_published=True,
        )
