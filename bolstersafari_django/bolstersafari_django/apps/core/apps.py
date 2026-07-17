import os
import time
import threading
import urllib.request
from django.apps import AppConfig


def keep_awake_ping():
    """Pings the Render external URL every 10 minutes to prevent sleep."""
    url = os.environ.get('RENDER_EXTERNAL_URL')
    if not url:
        return
    
    # Ping the lightweight public settings endpoint
    ping_url = f"{url}/api/settings/public/"
    
    while True:
        time.sleep(10 * 60)  # Wait 10 minutes
        try:
            req = urllib.request.Request(ping_url, headers={'User-Agent': 'KeepAlivePing/1.0'})
            urllib.request.urlopen(req, timeout=10)
        except Exception:
            pass  # Silently ignore errors


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.core'
    verbose_name = 'Core System Services'

    def ready(self):
        # Only start the background thread in production (when RENDER is true)
        # Avoid running multiple threads if running multiple workers (gunicorn pre-forks so each worker gets one thread, which is fine)
        if os.environ.get('RENDER') == 'true' and not os.environ.get('RUN_MAIN') == 'true':
            # RUN_MAIN is used by Django's autoreloader, but we only care about production here
            thread = threading.Thread(target=keep_awake_ping, daemon=True)
            thread.start()

