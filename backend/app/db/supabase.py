from supabase import create_client, Client
from app.core.config import settings

# Create a singleton Supabase client using the Service Role Key
# This gives the backend admin access to bypass RLS when performing trusted backend operations.
# Note: User requests must still be authorized via role-based access control in the route dependencies.
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
