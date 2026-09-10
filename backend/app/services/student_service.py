from app.repositories.student_repository import student_repository
from app.repositories.teacher_repository import teacher_repository
from app.repositories.class_repository import class_repository
from app.schemas.student import StudentCreate, StudentUpdate, StudentInDB
from app.schemas.user import UserInDB
from fastapi import HTTPException
from typing import List

class StudentService:
    def _get_teacher_class_ids(self, email: str) -> List[str]:
        teacher = teacher_repository.get_by_email(email)
        if not teacher:
            return []
        classes = class_repository.get_by_teacher_id(str(teacher.id))
        return [str(c.id) for c in classes]

    def _check_teacher_access(self, current_user: UserInDB, class_id: str):
        if current_user.role == "teacher":
            allowed_classes = self._get_teacher_class_ids(current_user.email)
            if str(class_id) not in allowed_classes:
                raise HTTPException(status_code=403, detail="Not authorized to access this student")

    def get_all(self, current_user: UserInDB) -> List[StudentInDB]:
        if current_user.role == "teacher":
            allowed_classes = self._get_teacher_class_ids(current_user.email)
            if not allowed_classes:
                return []
            return student_repository.get_by_class_ids(allowed_classes)
        return student_repository.get_all()

    def get_by_id(self, student_id: str, current_user: UserInDB) -> StudentInDB:
        student = student_repository.get_by_id(student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        if student.class_id:
            self._check_teacher_access(current_user, str(student.class_id))
        elif current_user.role == "teacher":
            raise HTTPException(status_code=403, detail="Not authorized to access this student")
            
        return student

    def create(self, student: StudentCreate, current_user: UserInDB) -> StudentInDB:
        # Check for duplicate student_id
        existing = [s for s in student_repository.get_all() if s.student_id == student.student_id]
        if existing:
            raise HTTPException(status_code=409, detail="Student ID already exists")
            
        if student.class_id:
            self._check_teacher_access(current_user, str(student.class_id))
        elif current_user.role == "teacher":
             raise HTTPException(status_code=403, detail="Not authorized to create this student without a class")

        return student_repository.create(student)

    def update(self, student_id: str, student: StudentUpdate, current_user: UserInDB) -> StudentInDB:
        existing_student = student_repository.get_by_id(student_id)
        if not existing_student:
            raise HTTPException(status_code=404, detail="Student not found")
            
        if existing_student.class_id:
            self._check_teacher_access(current_user, str(existing_student.class_id))
        elif current_user.role == "teacher":
             raise HTTPException(status_code=403, detail="Not authorized to update this student")
             
        if student.class_id and str(student.class_id) != str(existing_student.class_id):
            self._check_teacher_access(current_user, str(student.class_id))

        updated = student_repository.update(student_id, student)
        if not updated:
            raise HTTPException(status_code=404, detail="Student not found")
        return updated

    def delete(self, student_id: str, current_user: UserInDB) -> bool:
        existing_student = student_repository.get_by_id(student_id)
        if not existing_student:
            raise HTTPException(status_code=404, detail="Student not found")
            
        if existing_student.class_id:
            self._check_teacher_access(current_user, str(existing_student.class_id))
        elif current_user.role == "teacher":
             raise HTTPException(status_code=403, detail="Not authorized to delete this student")

        if not student_repository.delete(student_id):
            raise HTTPException(status_code=404, detail="Student not found")
        return True

student_service = StudentService()
