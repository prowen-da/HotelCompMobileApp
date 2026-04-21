"""
Django ASGI application served via uvicorn.
The supervisor runs: uvicorn server:app --host 0.0.0.0 --port 8001
This file bridges that command to Django's ASGI handler.
"""
import os
import sys

# Ensure the backend directory is on the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

# Setup Django BEFORE importing the ASGI application
import django
django.setup()

from django.core.asgi import get_asgi_application

# This is the ASGI app that uvicorn will serve
app = get_asgi_application()
