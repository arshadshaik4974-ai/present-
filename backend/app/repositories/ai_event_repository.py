from app.db.supabase import supabase
from app.schemas.ai import AIEventCreate, AIEventInDB
from typing import List

class AIEventRepository:
    def get_recent(self, limit: int = 100) -> List[AIEventInDB]:
        res = supabase.table("ai_events").select("*").order("timestamp", desc=True).limit(limit).execute()
        return [AIEventInDB(**item) for item in res.data]

    def create(self, event: AIEventCreate) -> AIEventInDB:
        data = event.model_dump(exclude_none=True)
        if 'student_id' in data and data['student_id']:
            data['student_id'] = str(data['student_id'])
            
        res = supabase.table("ai_events").insert(data).execute()
        return AIEventInDB(**res.data[0])

ai_event_repository = AIEventRepository()
