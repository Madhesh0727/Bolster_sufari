"""
Remaining App Models — Reviews, Referrals, Media, Coupons, Wishlist, Blog, Notifications, AI
"""

# ─── reviews/models.py ──────────────────────────────────────────────────────
# apps/reviews/models.py
REVIEWS_CONTENT = '''
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.ForeignKey("trips.Trip", on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey("accounts.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="reviews")
    reviewer_name = models.CharField(max_length=100)
    reviewer_avatar = models.CharField(max_length=500, blank=True)
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "bs_reviews"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.reviewer_name} — {self.trip.title} ({self.rating}★)"
'''
