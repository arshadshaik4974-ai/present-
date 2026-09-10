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
