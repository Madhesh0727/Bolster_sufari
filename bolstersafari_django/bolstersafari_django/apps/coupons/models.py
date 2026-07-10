import uuid
from django.db import models


class Coupon(models.Model):
    class DiscountType(models.TextChoices):
        FLAT = 'flat', 'Flat Amount (₹)'
        PERCENT = 'percent', 'Percentage (%)'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=200, blank=True)
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    max_uses = models.PositiveIntegerField(null=True, blank=True)
    used_count = models.PositiveIntegerField(default=0)
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_until = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bs_coupons'

    def __str__(self):
        return f"{self.code} — {self.discount_type}: {self.discount_value}"

    def calculate_discount(self, amount):
        from decimal import Decimal
        amount = Decimal(str(amount))
        if self.discount_type == self.DiscountType.FLAT:
            discount = self.discount_value
        else:
            discount = amount * (self.discount_value / Decimal('100'))
        if self.max_discount:
            discount = min(discount, self.max_discount)
        return min(discount, amount)

    @property
    def is_valid(self):
        from django.utils import timezone
        now = timezone.now()
        if not self.is_active:
            return False
        if self.max_uses and self.used_count >= self.max_uses:
            return False
        if self.valid_from and now < self.valid_from:
            return False
        if self.valid_until and now > self.valid_until:
            return False
        return True
