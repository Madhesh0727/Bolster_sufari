import uuid
from django.db import models


class Wishlist(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="wishlist")
    trip = models.ForeignKey("trips.Trip", on_delete=models.CASCADE, related_name="wishlisted_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bs_wishlists'
        unique_together = [['user', 'trip']]

    def __str__(self):
        return f"{self.user.display_name} ♥ {self.trip.title}"
