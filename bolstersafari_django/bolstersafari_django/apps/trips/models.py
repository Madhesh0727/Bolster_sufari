"""
Trips Models — BolsterSafari
Destination, Trip, TripDate, TripRequest
"""
import uuid
from django.db import models
from django.utils.text import slugify
from django.core.validators import MinValueValidator
from decimal import Decimal


class Destination(models.Model):
    """Normalized destination locations."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    country = models.CharField(max_length=100, default='India')
    description = models.TextField(blank=True)
    hero_image_url = models.URLField(max_length=500, blank=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bs_destinations'
        ordering = ['name']

    def __str__(self):
        return self.name


class TripCategory(models.TextChoices):
    GROUP = 'group', 'Group Tour'
    FAMILY = 'family', 'Family Trip'
    COUPLE = 'couple', 'Couple Getaway'
    SOLO = 'solo', 'Solo Adventure'
    SAFARI = 'safari', 'Safari'
    WILDLIFE = 'wildlife', 'Wildlife'
    BEACH = 'beach', 'Beach Getaway'
    MOUNTAIN = 'mountain', 'Mountain Trek'
    ADVENTURE = 'adventure', 'Adventure'
    CULTURAL = 'cultural', 'Cultural Tour'
    SPIRITUAL = 'spiritual', 'Spiritual Journey'


class Trip(models.Model):
    """Core trip/package model."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    destination = models.ForeignKey(
        Destination,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='trips'
    )
    destination_text = models.CharField(
        max_length=200,
        blank=True,
        help_text="Fallback text if destination FK not set"
    )
    category = models.CharField(
        max_length=50,
        choices=TripCategory.choices,
        default=TripCategory.GROUP,
        db_index=True
    )
    description = models.TextField(blank=True)
    days = models.PositiveIntegerField(default=1)
    nights = models.PositiveIntegerField(default=1)
    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    max_capacity = models.PositiveIntegerField(default=20)
    current_bookings = models.PositiveIntegerField(default=0)

    # JSON fields for flexible data
    food_included = models.JSONField(default=dict, blank=True)
    stay_details = models.JSONField(default=dict, blank=True)
    itinerary = models.JSONField(default=list, blank=True)
    highlights = models.JSONField(default=list, blank=True)
    gallery = models.JSONField(
        default=list,
        blank=True,
        help_text="Array of image URLs"
    )

    # Media
    cover_image_url = models.URLField(max_length=500, blank=True)

    # Status
    is_active = models.BooleanField(default=True, db_index=True)
    is_featured = models.BooleanField(default=False)
    
    # Customization
    agency_name = models.CharField(max_length=100, default='BOLSTER SAFARI')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bs_trips'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_active', 'category']),
            models.Index(fields=['is_featured', 'is_active']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            n = 1
            while Trip.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{n}"
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def destination_name(self):
        if self.destination:
            return self.destination.name
        return self.destination_text

    @property
    def available_seats(self):
        from django.utils import timezone
        now_date = timezone.now().date()
        # Use Python comprehension to take advantage of prefetched dates and avoid N+1 queries
        active_dates = [d for d in self.dates.all() if d.is_active and d.start_date and d.start_date >= now_date]
        if active_dates:
            return sum((d.available_seats or 0) for d in active_dates)
        return max(0, self.max_capacity - self.current_bookings)

    @property
    def is_soldout(self):
        return self.available_seats == 0

    @property
    def cover_image(self):
        """Returns first gallery image or cover_image_url."""
        if self.cover_image_url:
            return self.cover_image_url
        if self.gallery and isinstance(self.gallery, list) and len(self.gallery) > 0:
            return self.gallery[0]
        return None


class TripDate(models.Model):
    """Scheduled departure dates for a trip."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='dates')
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    available_seats = models.PositiveIntegerField(null=True, blank=True)
    price_override = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Override base trip price for this date"
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'bs_trip_dates'
        ordering = ['start_date']
        indexes = [
            models.Index(fields=['is_active', 'start_date']),
        ]

    def __str__(self):
        return f"{self.trip.title} — {self.start_date}"

    @property
    def effective_price(self):
        return self.price_override or self.trip.base_price




