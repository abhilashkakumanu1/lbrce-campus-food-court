from flask import Blueprint, request, jsonify
from api.services.supabase_service import supabase_service

bp = Blueprint('menu', __name__, url_prefix='/menu')


@bp.route('/stalls', methods=['GET'])
def list_stalls():
    client = supabase_service.get_client()
    res = (
        client.table('food_stalls')
        .select('*')
        .eq('is_active', True)
        .execute()
    )
    stalls = res.data or []
    return jsonify({'stalls': stalls})


@bp.route('/stalls/<int:stall_id>/items', methods=['GET'])
def list_items(stall_id):
    category = request.args.get('category')
    client = supabase_service.get_client()
    query = (
        client.table('menu_items')
        .select('*')
        .eq('stall_id', stall_id)
        .eq('is_available', True)
    )
    if category:
        query = query.eq('category', category)
    res = query.execute()
    items = res.data or []
    return jsonify({'stall_id': stall_id, 'items': items})


@bp.route('/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    client = supabase_service.get_client()
    res = (
        client.table('menu_items')
        .select('*')
        .eq('id', item_id)
        .single()
        .execute()
    )
    item = res.data
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    return jsonify({'item': item})


@bp.route('/search', methods=['GET'])
def search_menu():
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({'error': 'query parameter q is required'}), 400

    client = supabase_service.get_client()
    # using ilike equivalent via .ilike (if supported) or filter
    res = (
        client.table('menu_items')
        .select('*,food_stalls(name)')
        .ilike('name', f'%{q}%')
        .eq('is_available', True)
        .execute()
    )
    items = res.data or []
    # attach stall_name manually if not already
    results = []
    for mi in items:
        entry = mi.copy()
        fs = mi.get('food_stalls')
        if fs and isinstance(fs, list) and fs:
            entry['stall_name'] = fs[0].get('name')
        results.append(entry)
    return jsonify({'query': q, 'results': results})
