from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.schemas.teacher import TeacherCreate, TeacherUpdate, TeacherInDB
from app.services.teacher_service import teacher_service
from app.schemas.user import UserInDB
from app.api.deps import get_current_user, require_admin, require_principal

router = APIRouter()

@router.get("", response_model=List[TeacherInDB])
def read_teachers(current_user: UserInDB = Depends(require_principal)):
    return teacher_service.get_all()

@router.get("/{teacher_id}", response_model=TeacherInDB)
def read_teacher(teacher_id: str, current_user: UserInDB = Depends(require_principal)):
    return teacher_service.get_by_id(teacher_id)

@router.post("", response_model=TeacherInDB, status_code=201)
def create_teacher(teacher: TeacherCreate, current_user: UserInDB = Depends(require_admin)):
    return teacher_service.create(teacher)

@router.put("/{teacher_id}", response_model=TeacherInDB)
def update_teacher(teacher_id: str, teacher: TeacherUpdate, current_user: UserInDB = Depends(require_admin)):
    return teacher_service.update(teacher_id, teacher)

@router.delete("/{teacher_id}", status_code=204)
def delete_teacher(teacher_id: str, current_user: UserInDB = Depends(require_admin)):
    teacher_service.delete(teacher_id)
    return None
