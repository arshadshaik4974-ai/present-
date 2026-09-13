from app.repositories.attendance_repository import attendance_repository
from app.repositories.attendance_session_repository import attendance_session_repository
from app.repositories.teacher_repository import teacher_repository
from app.repositories.class_repository import class_repository
from app.repositories.student_repository import student_repository
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate, AttendanceInDB, AttendanceSessionCreate, AttendanceSessionUpdate, AttendanceSessionInDB
from app.schemas.user import UserInDB
from fastapi import HTTPException
from typing import List
from datetime import date, datetime

class AttendanceService:
    def _get_teacher_class_ids(self, email: str) -> List[str]:
        teacher = teacher_repository.get_by_email(email)
        if not teacher:
            return []
        classes = class_repository.get_by_teacher_id(str(teacher.id))
        return [str(c.id) for c in classes]

    def _get_teacher_id(self, email: str) -> str:
        teacher = teacher_repository.get_by_email(email)
        if not teacher:
            raise HTTPException(status_code=403, detail="User is not a teacher")
        return str(teacher.id)

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

    def create(self, attendance: AttendanceCreate, current_user: UserInDB = None) -> AttendanceInDB:
        if current_user:
            self._check_teacher_access(current_user, str(attendance.class_id))
        
        # Check for existing record
        existing = attendance_repository.get_by_student_date(str(attendance.student_id), attendance.date.isoformat())
        if existing:
            # If AI is making the request, just return existing so it doesn't crash
            if attendance.source == 'ai':
                return existing
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

    # --- Session Management ---

    def start_session(self, class_id: str, current_user: UserInDB) -> AttendanceSessionInDB:
        self._check_teacher_access(current_user, class_id)
        teacher_id = self._get_teacher_id(current_user.email) if current_user.role == 'teacher' else None
        
        if current_user.role != 'teacher':
            # For admin starting a session, we'd need to find the teacher of the class
            c = class_repository.get_by_id(class_id)
            if not c or not c.teacher_id:
                raise HTTPException(status_code=400, detail="Class has no assigned teacher")
            teacher_id = str(c.teacher_id)
            
        # Check if active session already exists for this class
        existing = attendance_session_repository.get_active_by_class(class_id)
        if existing:
            return existing
            
        session_create = AttendanceSessionCreate(
            class_id=class_id,
            date=date.today(),
            teacher_id=teacher_id,
            created_by=current_user.id
        )
        return attendance_session_repository.create(session_create)
        
    def end_session(self, session_id: str, current_user: UserInDB) -> AttendanceSessionInDB:
        session = attendance_session_repository.get_by_id(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
            
        self._check_teacher_access(current_user, str(session.class_id))
        
        # End session
        update_data = AttendanceSessionUpdate(status="completed", end_time=datetime.utcnow())
        updated = attendance_session_repository.update(session_id, update_data)
        
        # Auto-absent logic
        # 1. Get all students in the class
        students = student_repository.get_by_class_id(str(session.class_id))
        today = session.date.isoformat()
        
        # 2. Check who is absent
        for st in students:
            existing = attendance_repository.get_by_student_date(str(st.id), today)
            if not existing:
                # Mark absent
                absent_record = AttendanceCreate(
                    student_id=st.id,
                    class_id=session.class_id,
                    date=session.date,
                    status="absent",
                    source="ai" # Using 'ai' or 'system'
                )
                attendance_repository.create(absent_record)
                
        return updated
        
    def get_active_sessions(self, current_user: UserInDB) -> List[AttendanceSessionInDB]:
        sessions = attendance_session_repository.get_active_sessions()
        if current_user.role == "teacher":
            allowed_classes = self._get_teacher_class_ids(current_user.email)
            return [s for s in sessions if str(s.class_id) in allowed_classes]
        return sessions

attendance_service = AttendanceService()
