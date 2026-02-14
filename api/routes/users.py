from flask import Blueprint, request, jsonify
from api.middleware.auth_middleware import require_auth
from api.services.supabase_service import supabase_service

bp = Blueprint('users', __name__, url_prefix='/users')


@bp.route('/profile', methods=['GET', 'PUT'])
@require_auth
def profile():
    user_id = request.user_id
    client = supabase_service.get_client()

    if request.method == 'GET':
        res = (
            client.table('users')
            .select('*')
            .eq('id', user_id)
            .single()
            .execute()
        )
        user = res.data
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'user': user})

    # PUT update
    body = request.get_json(silent=True) or {}
    update_data = {k: v for k, v in body.items() if k in ['name', 'phone', 'telegram_id']}
    if not update_data:
        return jsonify({'error': 'No valid fields provided'}), 400
    res = (
        client.table('users')
        .update(update_data)
        .eq('id', user_id)
        .single()
        .execute()
    )
    return jsonify({'user': res.data})
