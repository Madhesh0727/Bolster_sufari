import uuid
from django.db import models
from django.utils.text import slugify


class MediaItem(models.Model):
    class MediaType(models.TextChoices):
        IMAGE = 'image', 'Image'
        VIDEO = 'video', 'Video'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, blank=True)
    media_type = models.CharField(max_length=20, choices=MediaType.choices)
    file = models.FileField(upload_to='gallery/', null=True, blank=True)
    url = models.URLField(max_length=500, blank=True)
    thumbnail_url = models.URLField(max_length=500, blank=True)
    tag = models.CharField(max_length=50, blank=True, db_index=True)
    sort_order = models.IntegerField(default=0)
    created_by = models.ForeignKey(
        'accounts.User', null=True, blank=True, on_delete=models.SET_NULL
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bs_media_items'
        ordering = ['sort_order', '-created_at']

    def __str__(self):
        return self.title or str(self.id)

    @property
    def media_url(self):
        if self.file:
            return self.file.url
        return self.url


class BlogPost(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=320, unique=True, blank=True)
    author = models.ForeignKey('accounts.User', null=True, on_delete=models.SET_NULL)
    cover_image_url = models.URLField(max_length=500, blank=True)       # legacy URL field
    cover_image = models.ImageField(upload_to='blog/', null=True, blank=True)  # new file upload
    youtube_embed_code = models.TextField(blank=True, help_text='Paste the full YouTube <iframe> embed code here')  # YouTube embed
    content = models.TextField()
    excerpt = models.TextField(blank=True, max_length=500)
    tags = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bs_blog_posts'
        ordering = ['-published_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
