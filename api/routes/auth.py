from flask import Blueprint, request, jsonify
from api.services.supabase_service import supabase_service

bp = Blueprint('auth', __name__, url_prefix='/auth')


@bp.route('/register', methods=['POST'])
def register():
    body = request.get_json(silent=True) or {}
    email = body.get('email')
    password = body.get('password')
    name = body.get('name')
    phone = body.get('phone')

    if not email or not password:
        return jsonify({'error': 'email and password are required'}), 400

    client = supabase_service.get_client()
    auth = client.auth
    res = auth.sign_up({"email": email, "password": password})
    if res.get('error'):
        return jsonify({'error': res['error']['message']}), 400

    user = res.get('user')
    session = res.get('session')

    # create profile row if user object present
    if user:
        try:
            client.table('users').insert(
                {
                    'id': user.get('id'),
                    'email': email,
                    'name': name,
                    'phone': phone,
                }
            ).execute()
        except Exception:
            # ignore failures here; profile can be created later
            pass

    return jsonify({'user': user, 'session': session}), 201


@bp.route('/login', methods=['POST'])
def login():
    body = request.get_json(silent=True) or {}
    email = body.get('email')
    password = body.get('password')

    if not email or not password:
        return jsonify({'error': 'email and password are required'}), 400

    client = supabase_service.get_client()
    auth = client.auth
    res = auth.sign_in_with_password({"email": email, "password": password})
    if res.get('error'):
        return jsonify({'error': res['error']['message']}), 401

    return jsonify({'user': res.get('user'), 'session': res.get('session')}), 200


@bp.route('/logout', methods=['POST'])
def logout():
    # token is typically sent in Authorization header but Supabase client uses stored
    client = supabase_service.get_client()
    try:
        client.auth.sign_out()
    except Exception:
        pass
    return jsonify({'message': 'logged out'})
