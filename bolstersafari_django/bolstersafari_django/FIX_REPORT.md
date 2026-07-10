# Fix Report

## Overview
This document logs the primary bugs, silenced exceptions, and logical flaws identified and resolved during the code audit of the Bolster Safari Django project.

## Resolved Issues

### 1. Silenced Exceptions (Empty Except Blocks)
- **`apps/core/middleware.py` (Line 24):** The `SiteSettingsMiddleware` was silently catching all exceptions. Fixed by logging `Exception as e` using the standard logger.
- **`apps/bookings/serializers.py` (Line 79 & 100):** The `BookingCreateSerializer` caught `User.DoesNotExist` and `Coupon.DoesNotExist` with a generic `pass`. These were converted to explicit ignores with comments explaining that invalid referral/coupon codes gracefully fallback to zero discounts rather than failing the transaction.
- **`apps/notifications/context_processors.py` (Line 13):** The `unread_notifications` processor silently ate database errors. Fixed by introducing logging so DB failures aren't masked.

### 2. Coupon Validation Data Types
- **`apps/coupons/models.py`:** The `calculate_discount` method threw `TypeError: unsupported operand type(s) for *: 'float' and 'decimal.Decimal'` when processing percentage discounts. Fixed by coercing the `amount` into a `Decimal` object before performing the multiplication.

### 3. AI Generated Coupon Types
- **`apps/core/admin_views.py`:** The AI coupon generator endpoint (`/api/admin/coupons/ai-generate/`) was generating coupons with `discount_type="FIXED"` and `"PERCENTAGE"`. However, the underlying Django Model Enum expects `'flat'` and `'percent'`. Fixed the random choice array to map correctly to the model schema.

### 4. Unused Imports (Dead Code)
- Removed unused imports across the project (e.g. unused Django ORM models like `Count`, `F`, `Q` in `apps/accounts/api_views.py` and `apps/bookings/api_views.py`) using `autoflake`. This cleans up the global namespace and improves code maintainability.
