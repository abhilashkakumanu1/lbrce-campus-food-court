import os


class Config:
    """Base configuration loaded from environment variables."""

    SECRET_KEY = os.environ.get("SECRET_KEY", "please-set-a-secret")
    SUPABASE_URL = os.environ.get("SUPABASE_URL")
    SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
    TELEGRAM_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")

    # Add other configuration variables as needed
