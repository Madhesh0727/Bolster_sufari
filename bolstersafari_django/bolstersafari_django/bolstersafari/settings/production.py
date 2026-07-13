"""
Django Settings — PRODUCTION
BolsterSafari

Inherits from base.py and overrides with production-hardened values.
All secrets MUST come from environment variables — never hardcode here.
"""
from .base import *

# ── Security ────────────────────────────────────────────────────
DEBUG = False
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['localhost'])

# Block direct browser access to Render backend — only allow API, media, admin, static paths
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'apps.core.middleware.APIOnlyMiddleware',   # ← blocks non-API direct access
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.core.middleware.SiteSettingsMiddleware',
    'apps.core.middleware.ReferralMiddleware',
    'apps.core.middleware.ForensicLogMiddleware',
]


# HTTPS enforcement
SECURE_SSL_REDIRECT = env.bool('SECURE_SSL_REDIRECT', default=True)
SECURE_HSTS_SECONDS = env.int('SECURE_HSTS_SECONDS', default=31536000)  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Cookies
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True

# Content security
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

# ── Email ───────────────────────────────────────────────────────
# Override console backend from base — use real SMTP in production
EMAIL_BACKEND = env(
    'EMAIL_BACKEND',
    default='django.core.mail.backends.smtp.EmailBackend'
)

# ── Cache ───────────────────────────────────────────────────────
REDIS_URL = env('REDIS_URL', default='')

if REDIS_URL:
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': REDIS_URL,
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            }
        }
    }
    CELERY_BROKER_URL = REDIS_URL
    CELERY_RESULT_BACKEND = REDIS_URL
else:
    # Fallback: local memory cache (no persistence, single-process only)
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        }
    }
    # Run Celery tasks synchronously if no broker
    CELERY_TASK_ALWAYS_EAGER = True
    CELERY_TASK_STORE_EAGER_RESULT = True

# ── Database ────────────────────────────────────────────────────
# Pooler compatibility (CONN_MAX_AGE, SSL) is auto-detected in base.py
# based on the DATABASE_URL host and port.
# Use Supabase Transaction Pooler URL (port 6543) in your Render env vars
# to get IPv4 support on Render's free tier.


# ── Static Files ────────────────────────────────────────────────
# WhiteNoise handles compressed static file serving
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# ── CORS ────────────────────────────────────────────────────────
# In production, allow all origins by default to support Vercel preview URLs.
# For strict security later, set this to False and use CORS_ALLOWED_ORIGINS.
CORS_ALLOW_ALL_ORIGINS = env.bool('CORS_ALLOW_ALL_ORIGINS', default=True)

CORS_ALLOWED_ORIGINS = env.list(
    'CORS_ALLOWED_ORIGINS',
    default=[]
)

# ── Logging ─────────────────────────────────────────────────────
LOGGING['root']['level'] = 'WARNING'
LOGGING['loggers']['apps']['level'] = 'INFO'
