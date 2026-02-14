from supabase import create_client
from api.config import Config


class SupabaseService:
    def __init__(self):
        self.client = None

    def get_client(self):
        """Return a supabase client, creating it if necessary."""
        if self.client is None:
            if not Config.SUPABASE_URL or not Config.SUPABASE_KEY:
                raise RuntimeError("Supabase URL and key must be configured")
            self.client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
        return self.client

    def get_user_from_token(self, token: str):
        """Verify a JWT token and return the associated user."""
        client = self.get_client()
        return client.auth.get_user(token)


supabase_service = SupabaseService()


def get_supabase_client():
    """Convenience accessor for the shared Supabase client."""
    return supabase_service.get_client()


def get_user_from_token(token: str):
    """Verify and return user dict for the provided JWT."""
    return supabase_service.get_user_from_token(token)
