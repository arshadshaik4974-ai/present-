from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate, AttendanceInDB
from app.services.attendance_service import attendance_service
from app.schemas.user import UserInDB
from app.api.deps import get_current_user, require_teacher

router = APIRouter()

@router.get("", response_model=List[AttendanceInDB])
def read_attendance_records(current_user: UserInDB = Depends(require_teacher)):
    return attendance_service.get_all(current_user)

@router.get("/{attendance_id}", response_model=AttendanceInDB)
def read_attendance(attendance_id: str, current_user: UserInDB = Depends(require_teacher)):
    return attendance_service.get_by_id(attendance_id, current_user)

@router.post("", response_model=AttendanceInDB, status_code=201)
def create_attendance(attendance: AttendanceCreate, current_user: UserInDB = Depends(require_teacher)):
    return attendance_service.create(attendance, current_user)

@router.put("/{attendance_id}", response_model=AttendanceInDB)
def update_attendance(attendance_id: str, attendance: AttendanceUpdate, current_user: UserInDB = Depends(require_teacher)):
    return attendance_service.update(attendance_id, attendance, current_user)

@router.delete("/{attendance_id}", status_code=204)
def delete_attendance(attendance_id: str, current_user: UserInDB = Depends(require_teacher)):
    attendance_service.delete(attendance_id, current_user)
    return None
