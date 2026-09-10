from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    username: str
    email: str
    full_name: str
    role: str = Field(pattern='^(principal|admin|teacher)$')
    is_active: bool = True

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    role: Optional[str] = Field(None, pattern='^(principal|admin|teacher)$')
    is_active: Optional[bool] = None

class UserInDB(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
