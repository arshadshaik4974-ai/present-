from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class CameraBase(BaseModel):
    name: str
    rtsp_url: str
    location: Optional[str] = None
    status: str = Field(default='inactive', pattern='^(active|inactive|error)$')

class CameraCreate(CameraBase):
    pass

class CameraUpdate(BaseModel):
    name: Optional[str] = None
    rtsp_url: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = Field(None, pattern='^(active|inactive|error)$')

class CameraInDB(CameraBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
