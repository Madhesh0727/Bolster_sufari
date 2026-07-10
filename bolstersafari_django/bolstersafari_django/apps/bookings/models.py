"""
Bookings Models — BolsterSafari
Booking, Coupon
"""
import uuid
import secrets
import string
from django.db import models


def generate_booking_ref():
    """Generate a cryptographically secure unique booking reference like BS-A3X9K2P8M.
    Uses secrets.choice for ~62^10 = 839 trillion combinations — not brute-forceable.
    """
    alphabet = string.ascii_uppercase + string.digits
    chars = ''.join(secrets.choice(alphabet) for _ in range(10))
    return f"BS-{chars}"


class PaymentStatus(models.TextChoices):
    PENDING = 'pending', 'Pending Verification'
    VERIFIED = 'verified', 'Verified'
    REJECTED = 'rejected', 'Rejected'
    REFUNDED = 'refunded', 'Refunded'


class Booking(models.Model):
    """A traveler booking for a trip."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking_ref = models.CharField(
        max_length=20,
        unique=True,
        default=generate_booking_ref,
        editable=False
    )

    # Trip reference
    trip = models.ForeignKey(
        'trips.Trip',
        on_delete=models.PROTECT,
        related_name='bookings'
    )
    trip_date = models.ForeignKey(
        'trips.TripDate',
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name='bookings'
    )

    # Customer details (no login required for booking)
    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)
    customer_whatsapp = models.CharField(max_length=20, blank=True)
    customer_age = models.PositiveIntegerField(null=True, blank=True)
    customer_aadhar = models.CharField(max_length=20, blank=True)
    customer_dob = models.DateField(null=True, blank=True)

    # Pricing
    number_of_people = models.PositiveIntegerField(default=1)
    base_amount = models.DecimalField(max_digits=10, decimal_places=2)
    margin_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    coupon = models.ForeignKey(
        'coupons.Coupon',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='bookings'
    )
    coupon_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # Razorpay Details
    razorpay_order_id = models.CharField(max_length=100, blank=True, db_index=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True)
    razorpay_signature = models.CharField(max_length=200, blank=True)

    # Status
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        db_index=True
    )
    ticket_sent = models.BooleanField(default=False)
    admin_notes = models.TextField(blank=True)

    # Referral tracking
    referred_by = models.ForeignKey(
        'accounts.User',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='referred_bookings'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'bs_bookings'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['payment_status', 'created_at']),
            models.Index(fields=['customer_email']),
        ]

    def __str__(self):
        return f"{self.booking_ref} - {self.customer_name}"

    @property
    def per_person_price(self):
        if self.number_of_people:
            return self.total_amount / self.number_of_people
        return self.total_amount


class AdditionalTraveler(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='additional_travelers')
    name = models.CharField(max_length=150)
    aadhar = models.CharField(max_length=20)
    dob = models.DateField()
    age = models.PositiveIntegerField()

    def __str__(self):
        return self.name


from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.db.models import F

@receiver(pre_delete, sender=Booking)
def restore_seats_on_delete(sender, instance, **kwargs):
    """Restore seats when a booking is deleted (e.g., auto-cleanup of pending bookings)"""
    if instance.payment_status in [PaymentStatus.PENDING, PaymentStatus.VERIFIED]:
        if instance.trip:
            # Only decrement if current_bookings is high enough (prevents CHECK constraint errors)
            instance.trip.__class__.objects.filter(pk=instance.trip.pk, current_bookings__gte=instance.number_of_people).update(current_bookings=F('current_bookings') - instance.number_of_people)
        if instance.trip_date:
            instance.trip_date.__class__.objects.filter(pk=instance.trip_date.pk).update(available_seats=F('available_seats') + instance.number_of_people)
