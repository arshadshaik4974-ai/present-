from app.repositories.class_repository import class_repository
from app.repositories.teacher_repository import teacher_repository
from app.schemas.class_schema import ClassCreate, ClassUpdate, ClassInDB
from app.schemas.user import UserInDB
from fastapi import HTTPException
from typing import List

class ClassService:
    def _check_teacher_access(self, current_user: UserInDB, class_obj: ClassInDB):
        if current_user.role == "teacher":
            teacher = teacher_repository.get_by_email(current_user.email)
            if not teacher or str(class_obj.teacher_id) != str(teacher.id):
                raise HTTPException(status_code=403, detail="Not authorized to access this class")

    def get_all(self, current_user: UserInDB) -> List[ClassInDB]:
        if current_user.role == "teacher":
            teacher = teacher_repository.get_by_email(current_user.email)
            if not teacher:
                raise HTTPException(status_code=403, detail="Teacher profile not found")
            return class_repository.get_by_teacher_id(str(teacher.id))
        return class_repository.get_all()

    def get_by_id(self, class_id: str, current_user: UserInDB) -> ClassInDB:
        class_obj = class_repository.get_by_id(class_id)
        if not class_obj:
            raise HTTPException(status_code=404, detail="Class not found")
        self._check_teacher_access(current_user, class_obj)
        return class_obj

    def create(self, class_obj: ClassCreate, current_user: UserInDB) -> ClassInDB:
        # Assuming only admin/principal can create classes, handled by router dependencies
        return class_repository.create(class_obj)

    def update(self, class_id: str, class_obj: ClassUpdate, current_user: UserInDB) -> ClassInDB:
        existing = class_repository.get_by_id(class_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Class not found")
        self._check_teacher_access(current_user, existing)
        
        updated = class_repository.update(class_id, class_obj)
        if not updated:
            raise HTTPException(status_code=404, detail="Class not found")
        return updated

    def delete(self, class_id: str, current_user: UserInDB) -> bool:
        existing = class_repository.get_by_id(class_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Class not found")
        self._check_teacher_access(current_user, existing)
        
        if not class_repository.delete(class_id):
            raise HTTPException(status_code=404, detail="Class not found")
        return True

class_service = ClassService()
