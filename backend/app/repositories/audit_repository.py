from app.db.supabase import supabase
from typing import Optional, Dict

class AuditRepository:
    def log_action(self, user_id: str, action: str, entity_type: str, entity_id: str, metadata: Optional[Dict] = None):
        """Log an action to the admin_audit_logs table."""
        try:
            data = {
                "user_id": user_id,
                "action": action,
                "entity_type": entity_type,
                "entity_id": entity_id,
                "metadata": metadata or {}
            }
            supabase.table("admin_audit_logs").insert(data).execute()
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to write audit log: {e}")

audit_repository = AuditRepository()
