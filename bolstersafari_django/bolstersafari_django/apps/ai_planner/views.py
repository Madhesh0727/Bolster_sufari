"""
AI Planner Views — BolsterSafari

Security Fixes:
- Exception details no longer exposed to frontend (logged server-side only)
- Updated from deprecated gemini-pro to gemini-1.5-flash
- Added JSON parse error handling
- Added rate limiting via ratelimit decorator
"""
import logging
import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.conf import settings
from django_ratelimit.decorators import ratelimit

logger = logging.getLogger('apps.ai_planner')


@ratelimit(key='ip', rate='10/h', method='POST', block=True)
@require_POST
def generate_itinerary(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON body'}, status=400)

    destination = data.get('destination', '').strip()
    if not destination:
        return JsonResponse({'error': 'destination is required'}, status=400)

    try:
        days = max(1, min(int(data.get('days', 3)), 30))
    except (ValueError, TypeError):
        days = 3

    style = data.get('style', 'adventure')

    api_key_gemini = getattr(settings, 'GEMINI_API_KEY', '')
    api_key_groq = getattr(settings, 'GROQ_API_KEY', '')
    api_key_openai = getattr(settings, 'OPENAI_API_KEY', '')

    if not any([api_key_gemini, api_key_groq, api_key_openai]):
        return JsonResponse({'error': 'AI planner is not configured on this server.'}, status=503)

    prompt = (
        f"Create a detailed {days}-day travel itinerary for {destination} "
        f"with a {style} travel style. Include day-by-day activities, local "
        f"food recommendations, and travel tips. Return as structured JSON "
        f"with key 'days' (array of objects with: day, title, activities, food, tips)."
    )

    response_text = None
    last_error = None

    # Try Gemini First
    if not response_text and api_key_gemini:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key_gemini)
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            response_text = response.text
        except Exception as e:
            last_error = f"Gemini error: {str(e)}"
            logger.warning(last_error)

    # Try Groq as fallback
    if not response_text and api_key_groq:
        try:
            from groq import Groq
            client = Groq(api_key=api_key_groq)
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama3-8b-8192",
            )
            response_text = chat_completion.choices[0].message.content
        except Exception as e:
            last_error = f"Groq error: {str(e)}"
            logger.warning(last_error)

    # Try OpenAI as final fallback
    if not response_text and api_key_openai:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key_openai)
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="gpt-3.5-turbo",
            )
            response_text = chat_completion.choices[0].message.content
        except Exception as e:
            last_error = f"OpenAI error: {str(e)}"
            logger.warning(last_error)

    if response_text:
        # Strip markdown code blocks if the LLM wraps the JSON
        if response_text.startswith("```json"):
            response_text = response_text[7:].strip()
        if response_text.endswith("```"):
            response_text = response_text[:-3].strip()
            
        return JsonResponse({'itinerary': response_text})
    else:
        logger.error(f'AI planner all fallback failed for destination={destination}. Last error: {last_error}')
        return JsonResponse(
            {'error': 'Unable to generate itinerary at this time. Please try again later.'},
            status=500
        )
