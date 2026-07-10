"""Blog API URL config."""
from django.urls import path
from apps.blog import api_views

urlpatterns = [
    path('', api_views.BlogListAPIView.as_view(), name='api_blog_list'),
    path('<slug:slug>/', api_views.BlogDetailAPIView.as_view(), name='api_blog_detail'),
]
