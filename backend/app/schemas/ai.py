from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class AIEventBase(BaseModel):
    event_type: str = Field(pattern='^(person_detected|face_detected|face_recognized|unknown_person|attendance_marked|camera_started|camera_stopped)$')
    camera_id: Optional[str] = None
    track_id: Optional[str] = None
    student_id: Optional[UUID] = None
    confidence: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = None

class AIEventCreate(AIEventBase):
    pass

class AIEventInDB(AIEventBase):
    id: UUID
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
