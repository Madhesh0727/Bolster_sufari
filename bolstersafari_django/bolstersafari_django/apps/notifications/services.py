"""
Notification Service — BolsterSafari
Handles in-app + email notifications
"""
import logging
from typing import Optional, Dict, Any
from celery import shared_task

logger = logging.getLogger('apps.notifications')


def send_notification(
    recipient,
    notification_type: str,
    title: str,
    message: str,
    data: Optional[Dict[str, Any]] = None,
):
    """
    Create an in-app notification.
    If recipient is None (anonymous booking), skip in-app but log.
    """
    from apps.notifications.models import Notification

    if recipient is None:
        logger.info(f"Notification skipped (anonymous): {title}")
        return None

    try:
        notif = Notification.objects.create(
            recipient=recipient,
            notification_type=notification_type,
            title=title,
            message=message,
            data=data or {},
        )
        logger.info(f"Notification sent to {recipient.display_name}: {title}")
        return notif
    except Exception as e:
        logger.error(f"Failed to create notification: {e}")
        return None


@shared_task
def notify_admins(
    notification_type: str,
    title: str,
    message: str,
    data: Optional[Dict[str, Any]] = None,
):
    """
    Send a notification to ALL active admin users.
    Called when:
    - New KYC request submitted
    - New trip request submitted (BUG FIX: was never called before)
    - New payment received
    """
    from apps.accounts.models import User, UserRole

    admins = User.objects.filter(role=UserRole.ADMIN, is_active=True)
    count = 0
    for admin in admins:
        send_notification(admin, notification_type, title, message, data)
        count += 1

    logger.info(f"Notified {count} admins: {title}")
    return count
