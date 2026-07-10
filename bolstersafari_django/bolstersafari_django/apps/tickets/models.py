"""
Tickets Models — BolsterSafari
E-Ticket system with multi-phase workflow:
Admin creates → Assigns to traveler → Agent verifies
"""
import uuid
import secrets
from django.db import models


class TicketStatus(models.TextChoices):
    DRAFT = 'draft', 'Draft'
    ISSUED = 'issued', 'Issued to Traveler'
    DISTRIBUTED = 'distributed', 'Distributed'
    VERIFIED = 'verified', 'Verified by Agent'
    USED = 'used', 'Used / Checked-In'
    CANCELLED = 'cancelled', 'Cancelled'
    EXPIRED = 'expired', 'Expired'


def generate_ticket_number():
    """Generate unique ticket number like TKT-2024-XXXXX."""
    return f"TKT-{secrets.token_hex(3).upper()}"


class ETicket(models.Model):
    """
    E-Ticket with multi-phase lifecycle:
    1. Admin creates ticket (DRAFT)
    2. Admin issues to traveler (ISSUED) → Email sent
    3. Traveler shares with agent (DISTRIBUTED)
    4. Agent verifies QR code (VERIFIED)
    5. Traveler checks in (USED)
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_number = models.CharField(
        max_length=30,
        unique=True,
        default=generate_ticket_number,
        editable=False
    )
    # Verification token for QR code
    verification_token = models.CharField(
        max_length=64,
        unique=True,
        blank=True,
        editable=False
    )

    # Linked booking
    booking = models.OneToOneField(
        'bookings.Booking',
        on_delete=models.CASCADE,
        related_name='eticket'
    )

    # Trip snapshot (stored at ticket creation for immutability)
    trip_title = models.CharField(max_length=200)
    trip_destination = models.CharField(max_length=200, blank=True)
    trip_dates = models.CharField(max_length=100, blank=True)
    trip_duration = models.CharField(max_length=50, blank=True)
    trip_cover_image = models.URLField(max_length=500, blank=True)

    # Traveler details snapshot
    traveler_name = models.CharField(max_length=150)
    traveler_email = models.EmailField()
    traveler_phone = models.CharField(max_length=20)
    number_of_people = models.PositiveIntegerField(default=1)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # Itinerary snapshot
    itinerary_snapshot = models.JSONField(default=list, blank=True)
    inclusions_snapshot = models.JSONField(default=dict, blank=True)

    # Meeting point / logistics
    meeting_point = models.CharField(max_length=300, blank=True)
    meeting_time = models.DateTimeField(null=True, blank=True)
    pickup_details = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=200, blank=True)
    special_notes = models.TextField(blank=True)

    # Status & Workflow
    status = models.CharField(
        max_length=20,
        choices=TicketStatus.choices,
        default=TicketStatus.DRAFT,
        db_index=True
    )

    # Who created, issued, verified this ticket
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_tickets'
    )
    issued_to_email = models.EmailField(blank=True)
    issued_at = models.DateTimeField(null=True, blank=True)

    # Agent who verified
    verified_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_tickets'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    verification_location = models.CharField(max_length=200, blank=True)

    # Check-in
    checked_in_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bs_etickets'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['verification_token']),
            models.Index(fields=['traveler_email']),
        ]

    def __str__(self):
        return f"{self.ticket_number} — {self.traveler_name}"

    def save(self, *args, **kwargs):
        if not self.verification_token:
            self.verification_token = secrets.token_urlsafe(48)
        super().save(*args, **kwargs)

    @property
    def qr_data(self):
        """Data encoded in QR code for verification."""
        return f"BSTICKET:{self.ticket_number}:{self.verification_token}"

    @property
    def verify_url(self):
        """URL for agent to scan and verify."""
        return f"/tickets/verify/{self.verification_token}/"

    @property
    def is_verifiable(self):
        return self.status in [TicketStatus.ISSUED, TicketStatus.DISTRIBUTED]

    @property
    def is_active(self):
        return self.status not in [TicketStatus.CANCELLED, TicketStatus.EXPIRED]


class TicketStatusLog(models.Model):
    """Audit trail for every ticket status change."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket = models.ForeignKey(
        ETicket,
        on_delete=models.CASCADE,
        related_name='status_logs'
    )
    from_status = models.CharField(max_length=20, blank=True)
    to_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='ticket_status_changes'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bs_ticket_status_logs'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.ticket.ticket_number}: {self.from_status} → {self.to_status}"
