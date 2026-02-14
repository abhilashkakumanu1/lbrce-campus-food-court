from flask import Blueprint, request, jsonify
from api.middleware.auth_middleware import require_admin
from api.services.supabase_service import supabase_service
from api.services.telegram import send_order_notification_to_student

bp = Blueprint('admin', __name__, url_prefix='/admin')


# ──────────────────────────────────────────────
# Order Management
# ──────────────────────────────────────────────


@bp.route('/orders/pending', methods=['GET'])
@require_admin
def get_pending_orders():
    client = supabase_service.get_client()
    res = (
        client.table('orders')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', asc=True)
        .execute()
    )
    orders = res.data or []
    for order in orders:
        uid = order.get('user_id')
        usr = (
            client.table('users')
            .select('name,phone,telegram_id')
            .eq('id', uid)
            .single()
            .execute()
        )
        order['user'] = usr.data

        stall = (
            client.table('food_stalls')
            .select('name')
            .eq('id', order.get('stall_id'))
            .single()
            .execute()
        )
        order['stall'] = stall.data

        items = (
            client.table('order_items')
            .select('*,menu_items(name,price)')
            .eq('order_id', order.get('id'))
            .execute()
        )
        order['items'] = items.data or []

    return jsonify(orders)


@bp.route('/orders', methods=['GET'])
@require_admin
def get_all_orders():
    client = supabase_service.get_client()
    status = request.args.get('status')
    date = request.args.get('date')

    query = client.table('orders').select('*')
    if status:
        query = query.eq('status', status)
    if date:
        query = query.eq('created_at', date)  # simplistic; may need range
    query = query.order('created_at', desc=True)
    res = query.execute()
    orders = res.data or []

    for order in orders:
        uid = order.get('user_id')
        usr = (
            client.table('users')
            .select('name,phone,telegram_id')
            .eq('id', uid)
            .single()
            .execute()
        )
        order['user'] = usr.data

        stall = (
            client.table('food_stalls')
            .select('name')
            .eq('id', order.get('stall_id'))
            .single()
            .execute()
        )
        order['stall'] = stall.data

        items = (
            client.table('order_items')
            .select('*,menu_items(name,price)')
            .eq('order_id', order.get('id'))
            .execute()
        )
        order['items'] = items.data or []

    return jsonify(orders)


@bp.route('/orders/<int:order_id>/approve', methods=['POST'])
@require_admin
def approve_order(order_id):
    client = supabase_service.get_client()
    body = request.get_json(silent=True) or {}
    est = body.get('estimated_time')

    order_res = (
        client.table('orders')
        .select('*')
        .eq('id', order_id)
        .single()
        .execute()
    )
    order = order_res.data
    if not order or order.get('status') != 'pending':
        return jsonify({'error': 'Order is not in pending state'}), 400

    update = {'status': 'approved'}
    if est is not None:
        update['estimated_time'] = est
    client.table('orders').update(update).eq('id', order_id).execute()

    # notify user
    user_res = (
        client.table('users')
        .select('telegram_id')
        .eq('id', order.get('user_id'))
        .single()
        .execute()
    )
    tid = user_res.data and user_res.data.get('telegram_id')
    msg = f"Your order #{order_id} has been approved!"
    if est is not None:
        msg += f" It will be ready in {est} minutes."
    send_order_notification_to_student(tid, msg)

    order['status'] = 'approved'
    if est is not None:
        order['estimated_time'] = est
    return jsonify({'order': order, 'message': 'Order approved'})


@bp.route('/orders/<int:order_id>/reject', methods=['POST'])
@require_admin
def reject_order(order_id):
    client = supabase_service.get_client()
    body = request.get_json(silent=True) or {}
    reason = body.get('reason', '')

    order_res = (
        client.table('orders')
        .select('*')
        .eq('id', order_id)
        .single()
        .execute()
    )
    order = order_res.data
    if not order or order.get('status') != 'pending':
        return jsonify({'error': 'Order is not in pending state'}), 400

    update = {'status': 'rejected', 'rejection_reason': reason}
    client.table('orders').update(update).eq('id', order_id).execute()

    user_res = (
        client.table('users')
        .select('telegram_id')
        .eq('id', order.get('user_id'))
        .single()
        .execute()
    )
    tid = user_res.data and user_res.data.get('telegram_id')
    msg = f"Your order #{order_id} was rejected. Reason: {reason}."
    send_order_notification_to_student(tid, msg)

    order.update(update)
    return jsonify({'order': order, 'message': 'Order rejected'})


@bp.route('/orders/<int:order_id>/ready', methods=['POST'])
@require_admin
def mark_ready(order_id):
    client = supabase_service.get_client()
    order_res = (
        client.table('orders')
        .select('*')
        .eq('id', order_id)
        .single()
        .execute()
    )
    order = order_res.data
    if not order or order.get('status') != 'approved':
        return jsonify({'error': 'Order is not in approved state'}), 400

    client.table('orders').update({'status': 'ready'}).eq('id', order_id).execute()

    # get user telegram and stall name
    user_res = (
        client.table('users')
        .select('telegram_id')
        .eq('id', order.get('user_id'))
        .single()
        .execute()
    )
    tid = user_res.data and user_res.data.get('telegram_id')
    stall_res = (
        client.table('food_stalls')
        .select('name')
        .eq('id', order.get('stall_id'))
        .single()
        .execute()
    )
    stall_name = stall_res.data and stall_res.data.get('name')
    msg = f"Your order #{order_id} is ready for pickup at {stall_name}!"
    send_order_notification_to_student(tid, msg)

    order['status'] = 'ready'
    return jsonify({'order': order, 'message': 'Order marked as ready'})


@bp.route('/orders/<int:order_id>/complete', methods=['POST'])
@require_admin
def complete_order(order_id):
    client = supabase_service.get_client()
    order_res = (
        client.table('orders')
        .select('*')
        .eq('id', order_id)
        .single()
        .execute()
    )
    order = order_res.data
    if not order or order.get('status') != 'ready':
        return jsonify({'error': 'Order is not in ready state'}), 400

    client.table('orders').update({'status': 'completed'}).eq('id', order_id).execute()
    order['status'] = 'completed'
    return jsonify({'order': order, 'message': 'Order completed'})


# ──────────────────────────────────────────────
# Menu Management
# ──────────────────────────────────────────────


@bp.route('/menu/items', methods=['POST'])
@require_admin
def add_menu_item():
    client = supabase_service.get_client()
    body = request.get_json(silent=True) or {}
    required = ['stall_id', 'name', 'price', 'category']
    for field in required:
        if field not in body:
            return jsonify({'error': f'{field} is required'}), 400
    if body['category'] not in ['main', 'snack', 'beverage', 'dessert']:
        return jsonify({'error': 'Invalid category'}), 400

    # verify stall exists
    stall = (
        client.table('food_stalls')
        .select('id')
        .eq('id', body['stall_id'])
        .single()
        .execute()
    )
    if not stall.data:
        return jsonify({'error': 'Stall not found'}), 400

    insert_res = client.table('menu_items').insert(body).execute()
    return jsonify({'item': insert_res.data[0]}), 201


@bp.route('/menu/items/<int:item_id>', methods=['PUT'])
@require_admin
def update_menu_item(item_id):
    client = supabase_service.get_client()
    body = request.get_json(silent=True) or {}
    # ensure item exists
    existing = (
        client.table('menu_items')
        .select('*')
        .eq('id', item_id)
        .single()
        .execute()
    )
    if not existing.data:
        return jsonify({'error': 'Item not found'}), 404

    update_data = {k: v for k, v in body.items() if k in ['name', 'price', 'is_available', 'image_url']}
    if not update_data:
        return jsonify({'error': 'No valid fields provided'}), 400

    res = client.table('menu_items').update(update_data).eq('id', item_id).execute()
    return jsonify({'item': res.data[0]})


@bp.route('/menu/items/<int:item_id>', methods=['DELETE'])
@require_admin
def delete_menu_item(item_id):
    client = supabase_service.get_client()
    existing = (
        client.table('menu_items')
        .select('id')
        .eq('id', item_id)
        .single()
        .execute()
    )
    if not existing.data:
        return jsonify({'error': 'Item not found'}), 404

    client.table('menu_items').delete().eq('id', item_id).execute()
    return jsonify({'message': 'Item deleted'})


# ──────────────────────────────────────────────
# Stats / Analytics
# ──────────────────────────────────────────────


@bp.route('/stats', methods=['GET'])
@require_admin
def get_stats():
    client = supabase_service.get_client()
    from datetime import date
    today = date.today().isoformat()

    # today's order count
    today_res = (
        client.table('orders')
        .select('*', count='exact')
        .gte('created_at', today)
        .execute()
    )
    today_orders = today_res.count or 0

    pending_res = (
        client.table('orders')
        .select('*', count='exact')
        .eq('status', 'pending')
        .execute()
    )
    pending_orders = pending_res.count or 0

    # compute revenue by pulling rows and summing
    rev_res = (
        client.table('orders')
        .select('total_amount')
        .gte('created_at', today)
        .in_('status', ['approved', 'ready', 'completed'])
        .execute()
    )
    today_revenue = sum(o.get('total_amount', 0) for o in (rev_res.data or []))

    # popular items top 5
    items_res = (
        client.table('order_items')
        .select('menu_item_id,quantity')
        .execute()
    )
    counts = {}
    for oi in (items_res.data or []):
        mid = oi.get('menu_item_id')
        counts[mid] = counts.get(mid, 0) + oi.get('quantity', 0)
    # fetch names for top 5
    popular = []
    for mid, cnt in sorted(counts.items(), key=lambda kv: kv[1], reverse=True)[:5]:
        mi_res = (
            client.table('menu_items')
            .select('name')
            .eq('id', mid)
            .single()
            .execute()
        )
        popular.append({'name': mi_res.data.get('name') if mi_res.data else None, 'count': cnt})

    stats = {
        'today_orders': today_orders,
        'pending_orders': pending_orders,
        'today_revenue': today_revenue,
        'popular_items': popular,
    }
    return jsonify(stats)
