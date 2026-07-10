import os
import django
from django.test import Client
import json

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bolstersafari.settings.development")
django.setup()

def test_endpoints():
    client = Client()
    with open('project_dump.json', 'r') as f:
        data = json.load(f)
    
    urls = data['urls']
    print(f"Testing {len(urls)} urls...")
    
    for url_info in urls:
        path = '/' + url_info['url'].replace('^', '').replace('$', '')
        
        # skip paths with parameters
        if '<' in path or '(?P<' in path:
            continue
            
        try:
            response = client.get(path)
            print(f"[{response.status_code}] {path} ({url_info['view_name']})")
        except Exception as e:
            print(f"[ERROR] {path} ({url_info['view_name']}): {e}")

if __name__ == '__main__':
    test_endpoints()
