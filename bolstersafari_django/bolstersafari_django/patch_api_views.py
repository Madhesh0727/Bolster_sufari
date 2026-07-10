with open('apps/bookings/api_views.py', 'r') as f:
    content = f.read()

content = content.replace("notify_admins(", "notify_admins.delay(")

with open('apps/bookings/api_views.py', 'w') as f:
    f.write(content)
