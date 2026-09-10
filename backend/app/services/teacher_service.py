from app.repositories.teacher_repository import teacher_repository
from app.schemas.teacher import TeacherCreate, TeacherUpdate, TeacherInDB
from fastapi import HTTPException
from typing import List

class TeacherService:
    def get_all(self) -> List[TeacherInDB]:
        return teacher_repository.get_all()

    def get_by_id(self, teacher_id: str) -> TeacherInDB:
        teacher = teacher_repository.get_by_id(teacher_id)
        if not teacher:
            raise HTTPException(status_code=404, detail="Teacher not found")
        return teacher

    def create(self, teacher: TeacherCreate) -> TeacherInDB:
        existing = [t for t in teacher_repository.get_all() if t.teacher_id == teacher.teacher_id]
        if existing:
            raise HTTPException(status_code=409, detail="Teacher ID already exists")
        return teacher_repository.create(teacher)

    def update(self, teacher_id: str, teacher: TeacherUpdate) -> TeacherInDB:
        updated = teacher_repository.update(teacher_id, teacher)
        if not updated:
            raise HTTPException(status_code=404, detail="Teacher not found")
        return updated

    def delete(self, teacher_id: str) -> bool:
        if not teacher_repository.delete(teacher_id):
            raise HTTPException(status_code=404, detail="Teacher not found")
        return True

teacher_service = TeacherService()
