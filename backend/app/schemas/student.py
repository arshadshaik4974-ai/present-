from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime
from uuid import UUID

class StudentBase(BaseModel):
    student_id: str
    roll_number: Optional[str] = None
    full_name: str
    class_id: Optional[UUID] = None
    section: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    parent_guardian: Optional[str] = None
    contact: Optional[str] = None
    status: str = 'active'
    face_enrolled: bool = False

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    student_id: Optional[str] = None
    roll_number: Optional[str] = None
    full_name: Optional[str] = None
    class_id: Optional[UUID] = None
    section: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    parent_guardian: Optional[str] = None
    contact: Optional[str] = None
    status: Optional[str] = None
    face_enrolled: Optional[bool] = None

class StudentInDB(StudentBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
