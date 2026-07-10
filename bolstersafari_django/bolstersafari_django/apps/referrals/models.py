import uuid
from django.db import models


class ReferralClick(models.Model):
    """Track referral link clicks."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    referrer = models.ForeignKey(
        'accounts.User', on_delete=models.CASCADE, related_name='referral_clicks'
    )
    trip = models.ForeignKey(
        'trips.Trip', null=True, blank=True, on_delete=models.SET_NULL
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bs_referral_clicks'
        indexes = [
            models.Index(fields=['referrer', 'created_at']),
        ]

    def __str__(self):
        return f"Click by {self.referrer.display_name}"
