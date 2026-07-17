"""Blog API serializers."""
from rest_framework import serializers
from apps.media_gallery.models import BlogPost


class BlogPostListSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'cover_image_url',
            'thumbnail', 'tags', 'author_name', 'published_at',
            'youtube_embed_code',
        ]

    def get_author_name(self, obj):
        return obj.author.display_name if obj.author else 'Bolster Safari'

    def get_thumbnail(self, obj):
        """Return uploaded image URL first, fallback to cover_image_url."""
        request = self.context.get('request')
        if obj.cover_image:
            url = obj.cover_image.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return obj.cover_image_url or ''


class BlogPostDetailSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt',
            'cover_image_url', 'thumbnail', 'youtube_embed_code',
            'tags', 'author_name', 'published_at', 'created_at',
        ]

    def get_author_name(self, obj):
        return obj.author.display_name if obj.author else 'Bolster Safari'

    def get_thumbnail(self, obj):
        request = self.context.get('request')
        if obj.cover_image:
            url = obj.cover_image.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return obj.cover_image_url or ''


class BlogPostWriteSerializer(serializers.ModelSerializer):
    """Serializer for admin create/update — handles multipart file upload."""
    cover_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt',
            'cover_image_url', 'cover_image', 'youtube_embed_code',
            'tags', 'status',
        ]
