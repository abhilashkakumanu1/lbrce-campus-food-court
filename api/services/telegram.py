import os
import requests
import logging
from api.config import Config
from api.services.supabase_service import get_supabase_client

TELEGRAM_API_URL = "https://api.telegram.org/bot{token}/{method}"


def send_telegram_message(chat_id, message):
    """Send a message to a Telegram chat id without raising errors."""
    if not chat_id:
        return
    url = TELEGRAM_API_URL.format(token=Config.TELEGRAM_TOKEN, method="sendMessage")
    payload = {"chat_id": chat_id, "text": message}
    try:
        resp = requests.post(url, json=payload, timeout=5)
        if not resp.ok:
            logging.error("Telegram API error %s: %s", resp.status_code, resp.text)
    except Exception as exc:
        logging.error("Failed to send telegram message: %s", exc)


# legacy helpers
def notify_admin_new_order(order_id, user_id, stall_id, total_amount):
    """Legacy helper; sends to single admin chat from env var."""
    chat_id = os.environ.get("TELEGRAM_ADMIN_CHAT")
    if not chat_id:
        return
    text = (
        f"New order {order_id} from user {user_id} at stall {stall_id}: "
        f"₹{total_amount:.2f}"
    )
    send_telegram_message(chat_id, text)


def notify_admins_new_order(order_id, user_name, stall_name, total_amount):
    """Notify all admins with telegram_id about a new order."""
    client = get_supabase_client()
    res = (
        client.table('users')
        .select('telegram_id')
        .eq('role', 'admin')
        .not_('telegram_id', None)
        .execute()
    )
    admins = res.data or []
    message = (
        f"New order #{order_id} from {user_name} - {stall_name} - ₹{total_amount:.2f}"
    )
    for admin in admins:
        send_telegram_message(admin.get('telegram_id'), message)


def notify_order_approved(user_telegram_id, order_id, estimated_time=None):
    if not user_telegram_id:
        return
    msg = f"Your order #{order_id} has been approved!"
    if estimated_time is not None:
        msg += f" It will be ready in {estimated_time} minutes."
    send_telegram_message(user_telegram_id, msg)


def notify_order_ready(user_telegram_id, order_id, stall_name):
    if not user_telegram_id:
        return
    msg = f"Your order #{order_id} is ready for pickup at {stall_name}!"
    send_telegram_message(user_telegram_id, msg)


def notify_order_rejected(user_telegram_id, order_id, reason):
    if not user_telegram_id:
        return
    msg = f"Your order #{order_id} was rejected. Reason: {reason}"
    send_telegram_message(user_telegram_id, msg)


# ✅ New top-level function to fix ImportError
def send_order_notification_to_student(user_telegram_id, order_id, stall_name):
    """
    This is the function expected by admin.py.
    Sends a notification that the order is ready.
    """
    notify_order_ready(user_telegram_id, order_id, stall_name)

