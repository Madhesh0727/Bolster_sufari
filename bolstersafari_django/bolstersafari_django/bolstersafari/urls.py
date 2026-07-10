"""
Root URL Configuration — BolsterSafari
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from apps.trips.api_views import public_settings_view

# Move admin to secure URL configured in .env
admin.site.site_header = "Bolster Safari — Admin"
admin.site.site_title = "Bolster Safari"
admin.site.index_title = "Administration"

urlpatterns = [
    # Django built-in admin at secure URL
    path(f'{settings.ADMIN_URL}/', admin.site.urls),

    # AI Planner API
    path('api/ai/', include('apps.ai_planner.urls')),

    # Admin API (React admin panel will be served by frontend)
    path('api/admin/', include('apps.core.admin_urls', namespace='admin_api')),

    # REST API
    path('api/', include([
        path('accounts/', include('apps.accounts.urls.api')),
        path('trips/', include('apps.trips.urls.api')),
        path('bookings/', include('apps.bookings.urls_api')),
        path('blog/', include('apps.blog.urls_api')),
        path('reviews/', include('apps.reviews.urls_api')),
        path('wishlist/', include('apps.wishlist.urls_api')),
        path('settings/public/', public_settings_view, name='api_public_settings'),
    ])),
]

# Serve media in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
