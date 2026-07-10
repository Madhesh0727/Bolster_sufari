"""
Supabase Storage Backend — BolsterSafari
Django-compatible custom storage backend using supabase-py SDK.
Used when SUPABASE_URL and SUPABASE_KEY are set in .env.

Usage (auto-activated in settings/base.py):
    DEFAULT_FILE_STORAGE = 'apps.core.storage.SupabaseStorage'
"""
import os
import mimetypes
import logging
from django.core.files.storage import Storage
from django.conf import settings
from django.utils.deconstruct import deconstructible

logger = logging.getLogger('apps.core')


@deconstructible
class SupabaseStorage(Storage):
    """
    Django storage backend that saves files to Supabase Storage.

    Requires:
        - SUPABASE_URL
        - SUPABASE_KEY (anon key is sufficient for public buckets)
        - SUPABASE_SERVICE_KEY (for admin operations: delete, replace)
        - SUPABASE_BUCKET
    """

    def __init__(self, bucket=None):
        self.bucket_name = bucket or settings.SUPABASE_BUCKET
        self._client = None

    def _get_client(self, use_service_key=False):
        """Lazy-initialize Supabase client."""
        from supabase import create_client
        key = settings.SUPABASE_SERVICE_KEY if use_service_key else settings.SUPABASE_KEY
        if not key:
            # Fall back to anon key if service key not set
            key = settings.SUPABASE_KEY
        return create_client(settings.SUPABASE_URL, key)

    def _save(self, name, content):
        """Upload a file to Supabase Storage."""
        try:
            client = self._get_client(use_service_key=True)
            content.seek(0)
            file_data = content.read()

            mime_type, _ = mimetypes.guess_type(name)
            if not mime_type:
                mime_type = 'application/octet-stream'

            client.storage.from_(self.bucket_name).upload(
                path=name,
                file=file_data,
                file_options={"content-type": mime_type, "upsert": "true"},
            )
            logger.info(f"SupabaseStorage: Uploaded {name} to bucket {self.bucket_name}")
            return name
        except Exception as e:
            logger.error(f"SupabaseStorage: Failed to upload {name}: {e}")
            raise

    def _open(self, name, mode='rb'):
        """Download a file from Supabase Storage."""
        try:
            client = self._get_client()
            data = client.storage.from_(self.bucket_name).download(name)
            from django.core.files.base import ContentFile
            return ContentFile(data)
        except Exception as e:
            logger.error(f"SupabaseStorage: Failed to open {name}: {e}")
            raise FileNotFoundError(f"File not found in Supabase Storage: {name}")

    def exists(self, name):
        """Check if a file exists in Supabase Storage."""
        try:
            client = self._get_client()
            # List with prefix to check existence
            folder = os.path.dirname(name)
            filename = os.path.basename(name)
            files = client.storage.from_(self.bucket_name).list(folder)
            return any(f.get('name') == filename for f in (files or []))
        except Exception as e:
            logger.warning(f"SupabaseStorage: exists() check failed for {name}: {e}")
            return False

    def url(self, name):
        """Return the public URL of a file."""
        if not name:
            return ''
        # Supabase public URL format
        base = settings.SUPABASE_URL.rstrip('/')
        bucket = self.bucket_name
        # URL-encode only the path separators are fine as-is
        return f"{base}/storage/v1/object/public/{bucket}/{name}"

    def delete(self, name):
        """Delete a file from Supabase Storage."""
        try:
            client = self._get_client(use_service_key=True)
            client.storage.from_(self.bucket_name).remove([name])
            logger.info(f"SupabaseStorage: Deleted {name}")
        except Exception as e:
            logger.error(f"SupabaseStorage: Failed to delete {name}: {e}")

    def size(self, name):
        """Return file size. Supabase doesn't expose this easily — return 0."""
        return 0

    def get_valid_name(self, name):
        """Clean the file name."""
        return name.replace(' ', '_')

    def get_available_name(self, name, max_length=None):
        """Supabase upsert handles overwrite — return name as-is."""
        return name
