from app.db.supabase import supabase
from app.schemas.attendance import AttendanceSessionCreate, AttendanceSessionUpdate, AttendanceSessionInDB
from typing import List, Optional

class AttendanceSessionRepository:
    def get_all(self) -> List[AttendanceSessionInDB]:
        res = supabase.table("attendance_sessions").select("*").execute()
        return [AttendanceSessionInDB(**item) for item in res.data]

    def get_by_id(self, session_id: str) -> Optional[AttendanceSessionInDB]:
        res = supabase.table("attendance_sessions").select("*").eq("id", session_id).execute()
        if not res.data:
            return None
        return AttendanceSessionInDB(**res.data[0])

    def get_active_by_class(self, class_id: str) -> Optional[AttendanceSessionInDB]:
        res = supabase.table("attendance_sessions").select("*").eq("class_id", class_id).eq("status", "active").execute()
        if not res.data:
            return None
        return AttendanceSessionInDB(**res.data[0])
        
    def get_active_sessions(self) -> List[AttendanceSessionInDB]:
        res = supabase.table("attendance_sessions").select("*").eq("status", "active").execute()
        return [AttendanceSessionInDB(**item) for item in res.data]

    def create(self, session: AttendanceSessionCreate) -> AttendanceSessionInDB:
        data = session.model_dump(exclude_none=True)
        data['class_id'] = str(data['class_id'])
        data['teacher_id'] = str(data['teacher_id'])
        data['created_by'] = str(data['created_by'])
        data['date'] = data['date'].isoformat()
        
        if 'start_time' in data and data['start_time']:
            data['start_time'] = data['start_time'].isoformat()
            
        res = supabase.table("attendance_sessions").insert(data).execute()
        return AttendanceSessionInDB(**res.data[0])

    def update(self, session_id: str, session: AttendanceSessionUpdate) -> Optional[AttendanceSessionInDB]:
        data = session.model_dump(exclude_none=True)
        if 'end_time' in data and data['end_time']:
            data['end_time'] = data['end_time'].isoformat()
            
        if not data:
            return self.get_by_id(session_id)
            
        res = supabase.table("attendance_sessions").update(data).eq("id", session_id).execute()
        if not res.data:
            return None
        return AttendanceSessionInDB(**res.data[0])

attendance_session_repository = AttendanceSessionRepository()
