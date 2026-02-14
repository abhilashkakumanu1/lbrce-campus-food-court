from functools import wraps
from flask import request, jsonify


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # TODO: check for valid token/cookie
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)

    return decorated


def require_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # TODO: verify admin privileges
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Admin authentication required'}), 401
        return f(*args, **kwargs)

    return decorated
