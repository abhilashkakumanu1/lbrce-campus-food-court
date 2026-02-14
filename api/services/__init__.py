"""
Services Package
================
This module makes the services/ folder a Python package.
Services contain business logic used by route handlers (order_service,
telegram utilities, Supabase wrapper, etc.).

Importing this package does **not** automatically create clients or establish
connections; individual modules should be imported explicitly when needed.
"""

# expose frequently-used service modules for easy access by routes
from . import order_service, telegram, supabase_service  # noqa: F401
