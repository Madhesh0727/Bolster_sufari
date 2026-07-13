#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate --noinput

# Create superuser from environment variables
python manage.py setup_admin

# Collect static files
python manage.py collectstatic --noinput
