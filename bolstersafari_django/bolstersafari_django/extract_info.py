import os
import sys
import django
import json

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bolstersafari.settings.development")
django.setup()

from django.urls import get_resolver, URLPattern, URLResolver
from django.apps import apps
from django.conf import settings

def get_urls(url_patterns, prefix=''):
    url_list = []
    for pattern in url_patterns:
        if isinstance(pattern, URLPattern):
            # Check if it's our app
            view_func = pattern.callback
            module = view_func.__module__ if hasattr(view_func, '__module__') else ''
            if module.startswith('apps.'):
                url_list.append({
                    'url': prefix + str(pattern.pattern),
                    'module': module,
                    'view_name': pattern.name
                })
        elif isinstance(pattern, URLResolver):
            url_list.extend(get_urls(pattern.url_patterns, prefix + str(pattern.pattern)))
    return url_list

def get_models():
    model_list = []
    for app_config in apps.get_app_configs():
        if app_config.name.startswith('apps.'):
            for model in app_config.get_models():
                model_list.append({
                    'app': app_config.name,
                    'model': model.__name__,
                    'fields': [f.name for f in model._meta.get_fields()]
                })
    return model_list

def main():
    resolver = get_resolver()
    urls = get_urls(resolver.url_patterns)
    models = get_models()
    
    with open('project_dump.json', 'w') as f:
        json.dump({'urls': urls, 'models': models}, f, indent=2)
    print(f"Dumped {len(urls)} urls and {len(models)} models.")

if __name__ == '__main__':
    main()
