"""
Core Middleware — BolsterSafari
Site settings injection + Referral tracking
"""
import logging
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('apps.core')


class SiteSettingsMiddleware(MiddlewareMixin):
    """Inject site settings into every request. Cached 5 minutes to avoid per-request DB hits."""

    CACHE_KEY = 'site_settings_all'
    CACHE_TTL = 300  # 5 minutes

    def process_request(self, request):
        try:
            from django.core.cache import cache
            from apps.notifications.models import SiteSetting

            settings_data = cache.get(self.CACHE_KEY)
            if settings_data is None:
                settings_qs = SiteSetting.objects.all()
                settings_data = {s.key: s.value for s in settings_qs}
                cache.set(self.CACHE_KEY, settings_data, self.CACHE_TTL)

            request.site_settings = settings_data
        except Exception as e:
            logger.error(f"Error fetching site settings: {e}")
            request.site_settings = {}


class ReferralMiddleware(MiddlewareMixin):
    """Track referral ?ref= parameter in session."""

    def process_request(self, request):
        if request.path.startswith('/static/') or request.path.startswith('/favicon'):
            return

        ref = request.GET.get('ref')
        margin = request.GET.get('margin')

        if ref:
            try:
                from apps.accounts.models import User
                from apps.referrals.models import ReferralClick
                from django.db.models import Q
                from django.utils import timezone
                from datetime import timedelta

                user = User.objects.filter(
                    Q(username=ref) | Q(id=ref),
                    is_active=True
                ).first()

                if user:
                    # Store referral in session
                    request.session['ref_user_id'] = str(user.id)
                    request.session['ref_user_name'] = user.display_name

                    # Validate margin server-side (was URL-manipulatable before)
                    try:
                        margin_val = float(margin) if margin else 0.0
                        # Cap margin at 50% of base trip price (validated per trip at booking)
                        margin_val = max(0.0, min(margin_val, 99999.0))
                    except (ValueError, TypeError):
                        margin_val = 0.0
                    request.session['referred_margin'] = margin_val

                    # Click deduplication (5 min window) — using Django ORM now
                    trip_id = None
                    if '/trip/' in request.path:
                        parts = request.path.strip('/').split('/')
                        try:
                            trip_id = parts[-1]
                        except (IndexError, ValueError) as e:
                            import logging
                            logging.getLogger(__name__).warning(f"Failed to parse trip_id from path {request.path}: {e}")

                    five_min_ago = timezone.now() - timedelta(minutes=5)
                    recent = ReferralClick.objects.filter(
                        referrer=user,
                        ip_address=request.META.get('REMOTE_ADDR', ''),
                        created_at__gte=five_min_ago
                    )
                    if trip_id:
                        recent = recent.filter(trip_id=trip_id)

                    if not recent.exists():
                        ReferralClick.objects.create(
                            referrer=user,
                            trip_id=trip_id,
                            ip_address=request.META.get('REMOTE_ADDR', ''),
                            user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                        )
            except Exception as e:
                logger.warning(f"Referral tracking error: {e}")


class ForensicLogMiddleware(MiddlewareMixin):
    """
    HTTP Middleware that logs forensic security metadata for all non-safe requests,
    unauthorized attempts (401/403), and admin activities.
    """
    def process_response(self, request, response):
        if request.path.startswith('/static/') or request.path.startswith('/favicon') or request.path.startswith('/media/'):
            return response

        # Audit conditions
        is_admin_path = 'secure-admin' in request.path or '/admin/' in request.path
        is_suspicious = response.status_code in [401, 403] or (response.status_code == 404 and is_admin_path)
        is_sensitive_write = request.method not in ('GET', 'HEAD', 'OPTIONS', 'TRACE') and (is_admin_path or '/portal/' in request.path or '/api/' in request.path)

        if is_suspicious or is_sensitive_write:
            try:
                from apps.core.models import ForensicLog
                ip = request.META.get('REMOTE_ADDR', '')
                ua = request.META.get('HTTP_USER_AGENT', '')[:500]
                
                event_type = 'suspicious_activity'
                if response.status_code == 403:
                    event_type = 'permission_denied'
                elif response.status_code == 404:
                    event_type = 'not_found_probe'
                elif is_sensitive_write:
                    event_type = 'data_mutation'

                description = f"Request {request.method} {request.path} returned status {response.status_code}"
                
                payload = {
                    'status_code': response.status_code,
                    'query_params': dict(request.GET.items()),
                }
                
                user = request.user if request.user.is_authenticated else None
                username_attempted = ''
                if not user and request.method == 'POST' and 'username' in request.POST:
                    username_attempted = request.POST.get('username')[:150]

                ForensicLog.objects.create(
                    event_type=event_type,
                    user=user,
                    username_attempted=username_attempted,
                    ip_address=ip,
                    user_agent=ua,
                    path=request.path[:500],
                    method=request.method,
                    description=description,
                    payload=payload
                )
            except Exception as e:
                logger.warning(f"Forensic logs write failure: {e}")

        return response
