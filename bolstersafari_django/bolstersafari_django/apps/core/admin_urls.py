from django.urls import path
from apps.core import admin_views

app_name = 'admin_api'

urlpatterns = [
    path('stats/', admin_views.DashboardStatsAPIView.as_view(), name='stats'),
    path('upload/', admin_views.AdminMediaUploadAPIView.as_view(), name='media_upload'),
    
    path('trips/', admin_views.AdminTripListCreateAPIView.as_view(), name='trip_list_create'),
    path('trips/<uuid:pk>/', admin_views.AdminTripDetailAPIView.as_view(), name='trip_detail'),
    path('trips/new/', admin_views.AdminTripListCreateAPIView.as_view(), name='trip_create'),
    

    
    path('bookings/', admin_views.AdminBookingListAPIView.as_view(), name='booking_list'),
    path('bookings/<uuid:pk>/', admin_views.AdminBookingDetailAPIView.as_view(), name='booking_detail'),
    
    path('users/', admin_views.AdminUserListAPIView.as_view(), name='user_list'),
    path('users/<uuid:pk>/', admin_views.AdminUserDetailAPIView.as_view(), name='user_detail'),
    path('users/<uuid:pk>/ban/', admin_views.AdminUserBanAPIView.as_view(), name='user_ban'),

    path('blog/', admin_views.AdminBlogListCreateAPIView.as_view(), name='blog_list_create'),
    path('blog/<uuid:pk>/', admin_views.AdminBlogDetailAPIView.as_view(), name='blog_detail'),

    path('coupons/', admin_views.AdminCouponListCreateAPIView.as_view(), name='coupon_list_create'),
    path('coupons/ai-generate/', admin_views.AdminCouponAIGenerateAPIView.as_view(), name='coupon_ai_generate'),
    path('coupons/<uuid:pk>/', admin_views.AdminCouponDetailAPIView.as_view(), name='coupon_detail'),
    path('system/reset-database/', admin_views.AdminResetDatabaseAPIView.as_view(), name='reset_database'),
]
