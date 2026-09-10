from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

class FaceEnrollmentRequest(BaseModel):
    image_base64: str

class FaceProfileInDB(BaseModel):
    id: UUID
    student_id: UUID
    enrollment_status: str
    model_name: Optional[str] = None
    model_version: Optional[str] = None
    quality_score: Optional[float] = None
    enrolled_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class FaceEnrollmentResponse(BaseModel):
    status: str
    student_id: str
    face_profile: Optional[FaceProfileInDB] = None
    message: Optional[str] = None
