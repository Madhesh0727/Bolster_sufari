"""Core decorators for view-level access control."""
from functools import wraps
from django.shortcuts import redirect
from django.contrib import messages


def role_required(*roles):
    """Decorator: require user to have one of the specified roles."""
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect(f'/portal/login/?next={request.path}')
            if request.user.role not in roles and not request.user.is_staff:
                messages.error(request, "Access denied.")
                return redirect('/')
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def admin_required(view_func):
    """Decorator: require admin or staff."""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect(f'/portal/login/?next={request.path}')
        if not (hasattr(request.user, 'is_admin') and request.user.is_admin) and not request.user.is_staff:
            messages.error(request, "Admin access required.")
            return redirect('/')
        return view_func(request, *args, **kwargs)
    return wrapper
