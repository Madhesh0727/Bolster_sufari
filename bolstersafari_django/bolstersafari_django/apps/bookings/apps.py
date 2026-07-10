from django.apps import AppConfig
import threading
import time
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger('apps.bookings')

def auto_delete_pending_bookings():
    """Background task that checks every hour and deletes pending bookings older than 8 hours."""
    # Give the app some time to fully load before starting the loop
    time.sleep(10)
    
    from apps.bookings.models import Booking, PaymentStatus
    
    while True:
        try:
            cutoff = timezone.now() - timedelta(hours=8)
            # Find old pending bookings
            old_bookings = Booking.objects.filter(
                payment_status=PaymentStatus.PENDING, 
                created_at__lt=cutoff
            )
            count = old_bookings.count()
            if count > 0:
                # This will trigger the pre_delete signal which restores the seats
                old_bookings.delete()
                logger.info(f"Auto-deleted {count} expired pending bookings.")
        except Exception as e:
            logger.error(f"Error auto-deleting pending bookings: {e}")
        
        # Sleep for 1 hour before checking again
        time.sleep(3600)

class BookingsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.bookings'

    def ready(self):
        import sys
        # Only start the background thread if we are running the actual server (not migrations, shell, etc)
        if 'runserver' in sys.argv or 'gunicorn' in sys.argv or 'wsgi' in sys.argv:
            t = threading.Thread(target=auto_delete_pending_bookings, daemon=True)
            t.start()
