"""Blog API serializers."""
from rest_framework import serializers
from apps.media_gallery.models import BlogPost


class BlogPostListSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'slug', 'excerpt', 'cover_image_url', 'tags', 'author_name', 'published_at']

    def get_author_name(self, obj):
        return obj.author.display_name if obj.author else 'Bolster Safari'


class BlogPostDetailSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'slug', 'content', 'excerpt', 'cover_image_url', 'tags', 'author_name', 'published_at', 'created_at']

    def get_author_name(self, obj):
        return obj.author.display_name if obj.author else 'Bolster Safari'
