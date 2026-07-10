"""Context processors — inject global data into all templates."""


def site_settings(request):
    """Inject site settings into every template."""
    settings_dict = getattr(request, 'site_settings', {})
    return {'site_settings': settings_dict}


def referral_context(request):
    """Inject referral margin from session."""
    return {
        'referred_margin': request.session.get('referred_margin', 0.0),
        'ref_user_name': request.session.get('ref_user_name', ''),
    }
