from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

class ClassBase(BaseModel):
    name: str
    section: str
    academic_year: Optional[str] = None
    teacher_id: Optional[UUID] = None
    room: Optional[str] = None
    status: str = 'active'

class ClassCreate(ClassBase):
    pass

class ClassUpdate(BaseModel):
    name: Optional[str] = None
    section: Optional[str] = None
    academic_year: Optional[str] = None
    teacher_id: Optional[UUID] = None
    room: Optional[str] = None
    status: Optional[str] = None

class ClassInDB(ClassBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
