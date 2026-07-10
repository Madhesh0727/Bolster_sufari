# BolsterSafari — Production Deployment Guide

This guide describes how to deploy the modernized **BolsterSafari** Django + Supabase PostgreSQL application to production (e.g., Render, Railway, Heroku).

---

## 1. Prerequisites

Before deploying, ensure you have:
1. **A Supabase Project**:
   - PostgreSQL database connection URI (`DATABASE_URL`).
   - Storage API credentials and a bucket named `bolstersafari-media`.
2. **AI API Keys**:
   - Google Gemini API Key (`GEMINI_API_KEY`).
3. **An SMTP/Email Provider**:
   - Gmail/App Password or SendGrid credentials for booking and E-Ticket notifications.

---

## 2. Environment Variables

Set the following environment variables in your hosting provider's dashboard:

| Variable | Value / Description | Example |
|---|---|---|
| `SECRET_KEY` | Generate a secure key for session crypt | `python -c "import secrets; print(secrets.token_hex(50))"` |
| `DEBUG` | Set to `False` | `False` |
| `ALLOWED_HOSTS` | Comma-separated list of domains | `bolstersafari.com,www.bolstersafari.com` |
| `DATABASE_URL` | Your Supabase pooled connection string | `postgresql://postgres:password@db.supabase.co:5432/postgres` |
| `SUPABASE_URL` | Your Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_KEY` | Your Supabase Anon Public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_KEY` | Your Supabase Service Role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |
| `EMAIL_BACKEND` | Use Django default SMTP backend | `django.core.mail.backends.smtp.EmailBackend` |
| `EMAIL_HOST` | SMTP server address | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP server port | `587` |
| `EMAIL_USE_TLS` | Enforce secure connection | `True` |
| `EMAIL_HOST_USER` | Email address to send mail from | `noreply@bolstersafari.com` |
| `EMAIL_HOST_PASSWORD`| Email application password | `xxxx xxxx xxxx xxxx` |
| `SITE_NAME` | Display name of the platform | `Bolster Safari` |
| `SITE_URL` | Base URL of the live platform | `https://www.bolstersafari.com` |
| `ADMIN_URL` | Customized secure admin path | `secure-admin` (makes it accessible via `/secure-admin/`) |
| `SECURE_SSL_REDIRECT` | Redirect HTTP to HTTPS | `True` |

---

## 3. Deployment Steps

Our `Procfile` is pre-configured to run the standard Django WSGI pipeline:
- Web process: `gunicorn bolstersafari.wsgi --log-file -`
- Release process: `python manage.py migrate --noinput && python manage.py collectstatic --noinput`

### A. Deploying to Render.com (Recommended)
1. Create a new **Web Service** on Render and link it to your GitHub repository.
2. Select **Python** as the environment.
3. Render automatically reads the `Procfile` and:
   - Executes migrations & static assets collection (`release` command).
   - Launches Gunicorn server (`web` command).
4. Add all environment variables listed in Section 2 under **Environment** settings.

### B. Deploying to Railway.app
1. Create a new project and select **GitHub Repository**.
2. Railway detects the `Procfile` and configures the start commands automatically.
3. Add environment variables under **Variables** tab.
4. Redeploy.

---

## 4. Post-Deployment Verification

1. Access your customized admin path: `https://yourdomain.com/secure-admin/`.
2. Login with the seeded superuser account:
   - **Username**: `admin`
   - **Password**: `Admin@2024` (Make sure to change this password on your first login!).
3. Visit the `🛡️ Forensic Logs` sidebar tab to verify that the security logger middleware is recording requests.
