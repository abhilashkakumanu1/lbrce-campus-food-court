"""
Order Service
=============
Business logic for order operations.

Separated from routes to keep route handlers thin.
Routes parse requests and return responses; this module
handles the database operations and calculations.
"""

from api.services.supabase_service import supabase_service
from api.services.telegram import notify_admin_new_order



def create_new_order(user_id, stall_id, items):
    """Create and persist a new order.

    See function docstring in conversation for full description.
    """
    client = supabase_service.get_client()

    # fetch menu items for all ids
    ids = [i["menu_item_id"] for i in items]
    res = (
        client.table("menu_items")
        .select("id,stall_id,price,is_available")
        .in_("id", ids)
        .execute()
    )
    menu_items = res.data or []

    # validations
    if len(menu_items) != len(ids):
        raise ValueError("One or more menu items do not exist")

    # map id -> item record for easy lookup
    item_map = {mi["id"]: mi for mi in menu_items}

    total_amount = 0.0
    for entry in items:
        mid = entry["menu_item_id"]
        qty = entry.get("quantity", 0)
        if mid not in item_map:
            raise ValueError(f"Menu item {mid} not found")
        mi = item_map[mid]
        if mi.get("stall_id") != stall_id:
            raise ValueError("Item does not belong to the specified stall")
        if not mi.get("is_available"):
            raise ValueError(f"Item {mid} is not available")
        total_amount += mi.get("price", 0) * qty

    # insert order
    order_payload = {
        "user_id": user_id,
        "stall_id": stall_id,
        "total_amount": total_amount,
        "status": "pending",
    }
    insert_res = client.table("orders").insert(order_payload).execute()
    if not insert_res.data:
        raise RuntimeError("Failed to create order")
    order_rec = insert_res.data[0]
    order_id = order_rec.get("id")

    # insert order items
    order_items_payload = []
    for entry in items:
        mid = entry["menu_item_id"]
        qty = entry.get("quantity", 0)
        mi = item_map[mid]
        order_items_payload.append(
            {
                "order_id": order_id,
                "menu_item_id": mid,
                "quantity": qty,
                "price_at_order": mi.get("price", 0),
            }
        )
    client.table("order_items").insert(order_items_payload).execute()

    # notify admins
    try:
        notify_admin_new_order(order_id, user_id, stall_id, total_amount)
    except Exception:
        # do not fail the request if notification fails
        pass

    return {
        "order_id": order_id,
        "total_amount": total_amount,
        "status": "pending",
        "created_at": order_rec.get("created_at"),
    }



def get_user_orders(user_id, status_filter=None):
    client = supabase_service.get_client()
    query = client.table("orders").select("*").eq("user_id", user_id)
    if status_filter:
        query = query.eq("status", status_filter)
    query = query.order("created_at", desc=True)
    res = query.execute()
    orders = res.data or []

    # enrich each order
    for order in orders:
        oid = order.get("id")
        items_res = (
            client.table("order_items")
            .select("*,menu_items(name,image_url)")
            .eq("order_id", oid)
            .execute()
        )
        order_items = items_res.data or []
        order["items"] = order_items

        # fetch stall name
        stall_res = (
            client.table("food_stalls")
            .select("name")
            .eq("id", order.get("stall_id"))
            .single()
            .execute()
        )
        order["stall"] = stall_res.data

    return orders


def get_order_detail(order_id, user_id):
    client = supabase_service.get_client()
    order_res = (
        client.table("orders")
        .select("*")
        .eq("id", order_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    order = order_res.data
    if not order:
        return None

    items_res = (
        client.table("order_items")
        .select("*,menu_items(name,image_url)")
        .eq("order_id", order_id)
        .execute()
    )
    order["items"] = items_res.data or []

    stall_res = (
        client.table("food_stalls")
        .select("*")
        .eq("id", order.get("stall_id"))
        .single()
        .execute()
    )
    order["stall"] = stall_res.data

    return order
