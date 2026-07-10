# API Report

## Overview
This report lists all validated and functional API endpoints for the Bolster Safari platform.

## Public Endpoints (No Authentication Required)

### Trips & Destinations
- `GET /api/trips/` - Retrieve a list of all active trips. Supports query params: `category`, `q` (search), `featured`.
- `GET /api/trips/<slug>/` - Retrieve full details for a specific trip, including itinerary and available dates.
- `GET /api/trips/categories/` - Retrieve all valid trip categories.
- `GET /api/trips/destinations/` - Retrieve a list of all destinations.

### Bookings
- `POST /api/bookings/create/` - Create a new booking and initialize a Razorpay order. Requires trip details and customer information.
- `POST /api/bookings/verify/` - Verify Razorpay payment signature and confirm the booking.
- `POST /api/bookings/coupon/validate/` - Validate a coupon code and return the calculated discount.

### Content
- `GET /api/blog/` - Retrieve published blog posts.
- `POST /api/reviews/submit/` - Submit a trip review.
- `GET /api/settings/public/` - Retrieve global site settings (site name, logo, contact info).
- `POST /api/ai/itinerary/` - Generate an AI itinerary using Gemini 1.5 Flash based on a destination.

## Protected Endpoints (Authentication Required)

### User Account
- `POST /api/accounts/token/` - Obtain JWT access/refresh tokens.
- `GET /api/accounts/me/` - Retrieve the current authenticated user's details.

### Admin Dashboards (Requires `is_superuser`)
- `GET /api/admin/stats/` - Retrieve global platform statistics (users, revenue, booking counts).
- `POST /api/admin/upload/` - Upload media to the server.
- `GET /POST /api/admin/trips/` - List or create new trips.
- `GET /PUT /DELETE /api/admin/trips/<uuid>/` - Manage specific trips.
- `GET /api/admin/bookings/` - View all bookings.
- `GET /api/admin/users/` - View all registered users.
- `POST /api/admin/users/<uuid>/ban/` - Toggle active status for a user.
- `POST /api/admin/coupons/ai-generate/` - AI-assisted generation of new promo codes.
