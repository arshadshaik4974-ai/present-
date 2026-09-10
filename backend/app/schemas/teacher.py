from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

class TeacherBase(BaseModel):
    teacher_id: str
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    subject: Optional[str] = None
    status: str = 'active'

class TeacherCreate(TeacherBase):
    pass

class TeacherUpdate(BaseModel):
    teacher_id: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    subject: Optional[str] = None
    status: Optional[str] = None

class TeacherInDB(TeacherBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
