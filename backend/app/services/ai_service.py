from app.repositories.ai_event_repository import ai_event_repository
from app.schemas.ai import AIEventCreate, AIEventInDB
from typing import List, Dict

class AIService:
    def __init__(self):
        # Current simulated status
        self.status = "not_initialized"

    def get_status(self) -> Dict[str, str]:
        return {"status": self.status, "message": "AI Engine is ready for the next phase"}

    def start_engine(self) -> Dict[str, str]:
        self.status = "running"
        ai_event_repository.create(AIEventCreate(event_type="camera_started", camera_id="SYSTEM"))
        return {"status": self.status}

    def stop_engine(self) -> Dict[str, str]:
        self.status = "stopped"
        ai_event_repository.create(AIEventCreate(event_type="camera_stopped", camera_id="SYSTEM"))
        return {"status": self.status}

    def get_recent_events(self) -> List[AIEventInDB]:
        return ai_event_repository.get_recent(limit=50)

ai_service = AIService()
