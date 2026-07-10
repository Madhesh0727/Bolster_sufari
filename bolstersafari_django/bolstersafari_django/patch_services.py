import re

with open('apps/notifications/services.py', 'r') as f:
    content = f.read()

content = content.replace("import logging\nfrom typing import Optional, Dict, Any", "import logging\nfrom typing import Optional, Dict, Any\nfrom celery import shared_task")

content = content.replace("def notify_admins(", "@shared_task\ndef notify_admins(")

with open('apps/notifications/services.py', 'w') as f:
    f.write(content)
