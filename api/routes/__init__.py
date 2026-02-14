"""
Routes Package
==============
This __init__.py makes the routes/ folder a Python package.
Import all blueprints here so app.py can register them.
"""

from flask import Blueprint

# import route submodules (they define `bp` blueprints)
from . import auth, users, menu, orders, admin  # noqa: F401

# expose blueprint objects for convenience
auth_bp = auth.bp
users_bp = users.bp
menu_bp = menu.bp
orders_bp = orders.bp
admin_bp = admin.bp
