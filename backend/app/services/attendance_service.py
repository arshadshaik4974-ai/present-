from app.repositories.attendance_repository import attendance_repository
from app.repositories.teacher_repository import teacher_repository
from app.repositories.class_repository import class_repository
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate, AttendanceInDB
from app.schemas.user import UserInDB
from fastapi import HTTPException
from typing import List

class AttendanceService:
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
                raise HTTPException(status_code=403, detail="Not authorized to access this attendance record")

    def get_all(self, current_user: UserInDB) -> List[AttendanceInDB]:
        if current_user.role == "teacher":
            allowed_classes = self._get_teacher_class_ids(current_user.email)
            if not allowed_classes:
                return []
            return attendance_repository.get_by_class_ids(allowed_classes)
        return attendance_repository.get_all()

    def get_by_id(self, attendance_id: str, current_user: UserInDB) -> AttendanceInDB:
        attendance = attendance_repository.get_by_id(attendance_id)
        if not attendance:
            raise HTTPException(status_code=404, detail="Attendance record not found")
        self._check_teacher_access(current_user, str(attendance.class_id))
        return attendance

    def create(self, attendance: AttendanceCreate, current_user: UserInDB) -> AttendanceInDB:
        self._check_teacher_access(current_user, str(attendance.class_id))
        
        # Check for existing record
        existing = attendance_repository.get_by_student_date(str(attendance.student_id), attendance.date.isoformat())
        if existing:
            raise HTTPException(status_code=409, detail="Attendance already recorded for this date")
            
        return attendance_repository.create(attendance)

    def update(self, attendance_id: str, attendance: AttendanceUpdate, current_user: UserInDB) -> AttendanceInDB:
        existing = attendance_repository.get_by_id(attendance_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Attendance record not found")
        self._check_teacher_access(current_user, str(existing.class_id))

        updated = attendance_repository.update(attendance_id, attendance)
        if not updated:
            raise HTTPException(status_code=404, detail="Attendance record not found")
        return updated

    def delete(self, attendance_id: str, current_user: UserInDB) -> bool:
        existing = attendance_repository.get_by_id(attendance_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Attendance record not found")
        self._check_teacher_access(current_user, str(existing.class_id))

        if not attendance_repository.delete(attendance_id):
            raise HTTPException(status_code=404, detail="Attendance record not found")
        return True

attendance_service = AttendanceService()
