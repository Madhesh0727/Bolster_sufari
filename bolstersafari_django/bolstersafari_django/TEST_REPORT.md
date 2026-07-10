# Test Report

## Overview
A comprehensive suite of unit and integration tests has been implemented using the standard Django `TestCase` and Django REST Framework `APIClient`. 

## Test Suites

### 1. Trips App (`apps/trips/tests.py`)
- **`TripModelTests`:**
  - `test_trip_creation`: Verifies slug generation and property methods.
  - `test_available_seats`: Validates the logic for calculating remaining seats based on `max_capacity` and `current_bookings`.
  - `test_is_soldout`: Confirms the boolean flag triggers correctly when capacity is reached.
- **`TripAPITests`:**
  - `test_get_trip_list`: Ensures the `/api/trips/` endpoint correctly serializes and returns active trips.
  - `test_get_trip_detail`: Verifies slug-based lookup and data integrity for a single trip.
  - `test_get_categories`: Confirms category enum serialization.

### 2. Bookings App (`apps/bookings/tests.py`)
- **`BookingAPITests`:**
  - `test_booking_create_validation`: Ensures required fields (name, email, aadhar) return proper 400 Bad Request errors when missing.
  - `test_coupon_validation`: Validates the math behind percentage and flat discount coupons via `/api/bookings/coupon/validate/`.
  - `test_invalid_coupon`: Confirms that expired or non-existent coupons return an appropriate invalid state without throwing server errors.

### 3. Accounts App (`apps/accounts/tests.py`)
- **`AccountsAPITests`:**
  - `test_login_success`: Validates JWT token generation upon correct credentials.
  - `test_login_failure`: Ensures 401 Unauthorized on bad passwords.
  - `test_me_endpoint_unauthenticated`: Prevents anonymous access to the user profile endpoint.
  - `test_me_endpoint_authenticated`: Verifies profile payload extraction using a forced authentication header.

## Summary Metrics
- **Tests Executed:** 13
- **Passed:** 13
- **Failed:** 0
- **Coverage Focus:** Business-critical pathways (Authentication, Payment Math, Capacity constraints).
