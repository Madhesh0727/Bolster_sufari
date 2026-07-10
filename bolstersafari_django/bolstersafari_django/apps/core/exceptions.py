from rest_framework.views import exception_handler
from rest_framework.response import Response
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Standardize error responses across the API.

    All responses follow the format:
        { success: bool, message: str, data: null, errors: dict|null }

    Never exposes stack traces or internal error details to clients.
    """
    response = exception_handler(exc, context)

    if response is not None:
        # Normalize DRF error responses to a standard format
        original_data = response.data
        if isinstance(original_data, dict):
            # Extract field-level validation errors
            errors = {
                k: v for k, v in original_data.items()
                if k not in ('detail', 'status_code')
            }
            message = ''
            if 'detail' in original_data:
                message = str(original_data['detail'])
            elif errors:
                message = 'Validation error. Please check the fields and try again.'

            response.data = {
                'success': False,
                'message': message,
                'data': None,
                'errors': errors if errors else None,
            }
        elif isinstance(original_data, list):
            response.data = {
                'success': False,
                'message': 'Validation error.',
                'data': None,
                'errors': original_data,
            }
    else:
        # Unhandled exception: log full traceback server-side, return generic message
        logger.error(f"Unhandled Exception in {context.get('view')}: {exc}", exc_info=True)
        return Response({
            'success': False,
            'message': 'An unexpected error occurred. Please try again later.',
            'data': None,
            'errors': None,
        }, status=500)

    return response
