from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.schemas.class_schema import ClassCreate, ClassUpdate, ClassInDB
from app.services.class_service import class_service
from app.schemas.user import UserInDB
from app.api.deps import get_current_user, require_admin, require_teacher

router = APIRouter()

@router.get("", response_model=List[ClassInDB])
def read_classes(current_user: UserInDB = Depends(require_teacher)):
    return class_service.get_all(current_user)

@router.get("/{class_id}", response_model=ClassInDB)
def read_class(class_id: str, current_user: UserInDB = Depends(require_teacher)):
    return class_service.get_by_id(class_id, current_user)

@router.post("", response_model=ClassInDB, status_code=201)
def create_class(class_obj: ClassCreate, current_user: UserInDB = Depends(require_admin)):
    return class_service.create(class_obj, current_user)

@router.put("/{class_id}", response_model=ClassInDB)
def update_class(class_id: str, class_obj: ClassUpdate, current_user: UserInDB = Depends(require_admin)):
    return class_service.update(class_id, class_obj, current_user)

@router.delete("/{class_id}", status_code=204)
def delete_class(class_id: str, current_user: UserInDB = Depends(require_admin)):
    class_service.delete(class_id, current_user)
    return None
