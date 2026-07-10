from django.apps import AppConfig
from django.conf import settings
import logging

logger = logging.getLogger('apps.ai_planner')

class AiPlannerConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.ai_planner'

    def ready(self):
        # Validate AI keys on startup
        api_key_gemini = getattr(settings, 'GEMINI_API_KEY', '')
        api_key_groq = getattr(settings, 'GROQ_API_KEY', '')
        api_key_openai = getattr(settings, 'OPENAI_API_KEY', '')
        
        if not any([api_key_gemini, api_key_groq, api_key_openai]):
            logger.warning("No AI API keys configured (GEMINI_API_KEY, GROQ_API_KEY, OPENAI_API_KEY). AI features will be disabled.")
