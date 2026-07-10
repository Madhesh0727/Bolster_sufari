"""Context processor for unread notifications count."""


def unread_notifications(request):
    count = 0
    if request.user.is_authenticated:
        try:
            from apps.notifications.models import Notification
            count = Notification.objects.filter(
                recipient=request.user, is_read=False
            ).count()
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Error fetching notifications: {e}")
    return {'unread_notifications_count': count}
