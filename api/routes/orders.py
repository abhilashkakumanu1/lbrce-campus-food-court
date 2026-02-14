from flask import Blueprint, request, jsonify
from api.middleware.auth_middleware import require_auth
from api.services.order_service import create_new_order, get_user_orders, get_order_detail

bp = Blueprint('orders', __name__, url_prefix='/orders')


@bp.route('', methods=['POST'])
@require_auth
def place_order():
    user_id = request.user_id  # assume middleware attaches this
    body = request.get_json(silent=True) or {}
    stall_id = body.get('stall_id')
    items = body.get('items', [])
    try:
        order = create_new_order(user_id, stall_id, items)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Failed to create order'}), 500
    return jsonify(order), 201


@bp.route('', methods=['GET'])
@require_auth
def list_orders():
    user_id = request.user_id
    status = request.args.get('status')
    orders = get_user_orders(user_id, status)
    return jsonify({'orders': orders})


@bp.route('/<int:order_id>', methods=['GET'])
@require_auth
def get_order(order_id):
    user_id = request.user_id
    order = get_order_detail(order_id, user_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    return jsonify({'order': order})
