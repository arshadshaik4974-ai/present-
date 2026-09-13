from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import date, datetime
from uuid import UUID

class AttendanceBase(BaseModel):
    student_id: UUID
    class_id: UUID
    date: date
    status: str = Field(pattern='^(present|absent|late|excused)$')
    source: str = Field(pattern='^(manual|teacher|ai)$')
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    confidence: Optional[float] = None

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern='^(present|absent|late|excused)$')
    source: Optional[str] = Field(None, pattern='^(manual|teacher|ai)$')
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    confidence: Optional[float] = None

class AttendanceInDB(AttendanceBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AttendanceSessionBase(BaseModel):
    class_id: UUID
    date: date
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: str = Field(default='active', pattern='^(active|completed)$')

class AttendanceSessionCreate(AttendanceSessionBase):
    teacher_id: UUID
    created_by: UUID

class AttendanceSessionUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern='^(active|completed)$')
    end_time: Optional[datetime] = None

class AttendanceSessionInDB(AttendanceSessionBase):
    id: UUID
    teacher_id: UUID
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
