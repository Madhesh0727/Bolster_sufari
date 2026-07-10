"""Blog API views."""
from rest_framework import generics
from rest_framework.permissions import AllowAny
from apps.media_gallery.models import BlogPost
from apps.blog.serializers import BlogPostListSerializer, BlogPostDetailSerializer


class BlogListAPIView(generics.ListAPIView):
    serializer_class = BlogPostListSerializer
    permission_classes = [AllowAny]
    queryset = BlogPost.objects.filter(status='published').order_by('-published_at')


class BlogDetailAPIView(generics.RetrieveAPIView):
    serializer_class = BlogPostDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    queryset = BlogPost.objects.filter(status='published')
