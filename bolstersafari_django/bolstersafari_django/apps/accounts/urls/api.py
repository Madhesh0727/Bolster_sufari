from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from apps.accounts import api_views

urlpatterns = [
    path('token/', api_views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', api_views.CurrentUserAPIView.as_view(), name='current_user'),
    path('customer/register/', api_views.CustomerRegistrationAPIView.as_view(), name='customer_register'),
    path('customer/dashboard/', api_views.CustomerDashboardAPIView.as_view(), name='customer_dashboard'),
    path('change-password/', api_views.ChangePasswordAPIView.as_view(), name='change_password'),
]
