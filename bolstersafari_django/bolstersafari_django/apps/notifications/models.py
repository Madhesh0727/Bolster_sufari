import uuid
from django.db import models


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        BOOKING_CONFIRMED = 'booking_confirmed', 'Booking Confirmed'
        BOOKING_VERIFIED = 'booking_verified', 'Booking Verified'
        TICKET_ISSUED = 'ticket_issued', 'Ticket Issued'
        KYC_APPROVED = 'kyc_approved', 'KYC Approved'
        KYC_REJECTED = 'kyc_rejected', 'KYC Rejected'
        TRIP_REQUEST_UPDATE = 'trip_request_update', 'Trip Request Updated'
        NEW_TRIP = 'new_trip', 'New Trip Available'
        GENERAL = 'general', 'General'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(
        'accounts.User', on_delete=models.CASCADE, related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=50, choices=NotificationType.choices, default=NotificationType.GENERAL
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    data = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bs_notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.recipient.display_name}: {self.title}"


class SiteSetting(models.Model):
    """Key-value site configuration."""
    key = models.CharField(max_length=100, primary_key=True)
    value = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bs_site_settings'

    def __str__(self):
        return f"{self.key} = {self.value[:50]}"
