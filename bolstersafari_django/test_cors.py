import environ

env = environ.Env()
environ.Env.read_env('/home/madhesh-rasu/Desktop/bolstersafari_django/render_env.txt')

origins = env.list('CORS_ALLOWED_ORIGINS', default=[])
print(origins)
