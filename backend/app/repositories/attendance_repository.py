from app.db.supabase import supabase
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate, AttendanceInDB
from typing import List, Optional

class AttendanceRepository:
    def get_all(self) -> List[AttendanceInDB]:
        res = supabase.table("attendance").select("*").execute()
        return [AttendanceInDB(**item) for item in res.data]

    def get_by_id(self, attendance_id: str) -> Optional[AttendanceInDB]:
        res = supabase.table("attendance").select("*").eq("id", attendance_id).execute()
        if not res.data:
            return None
        return AttendanceInDB(**res.data[0])

    def get_by_class_ids(self, class_ids: List[str]) -> List[AttendanceInDB]:
        if not class_ids:
            return []
        res = supabase.table("attendance").select("*").in_("class_id", class_ids).execute()
        return [AttendanceInDB(**item) for item in res.data]
        
    def get_by_student_date(self, student_id: str, date: str) -> Optional[AttendanceInDB]:
        res = supabase.table("attendance").select("*").eq("student_id", student_id).eq("date", date).execute()
        if not res.data:
            return None
        return AttendanceInDB(**res.data[0])

    def create(self, attendance: AttendanceCreate) -> AttendanceInDB:
        data = attendance.model_dump(exclude_none=True)
        data['student_id'] = str(data['student_id'])
        data['class_id'] = str(data['class_id'])
        data['date'] = data['date'].isoformat()
        
        if 'check_in_time' in data and data['check_in_time']:
            data['check_in_time'] = data['check_in_time'].isoformat()
        if 'check_out_time' in data and data['check_out_time']:
            data['check_out_time'] = data['check_out_time'].isoformat()
            
        res = supabase.table("attendance").insert(data).execute()
        return AttendanceInDB(**res.data[0])

    def update(self, attendance_id: str, attendance: AttendanceUpdate) -> Optional[AttendanceInDB]:
        data = attendance.model_dump(exclude_none=True)
        
        if 'check_in_time' in data and data['check_in_time']:
            data['check_in_time'] = data['check_in_time'].isoformat()
        if 'check_out_time' in data and data['check_out_time']:
            data['check_out_time'] = data['check_out_time'].isoformat()
            
        if not data:
            return self.get_by_id(attendance_id)
            
        res = supabase.table("attendance").update(data).eq("id", attendance_id).execute()
        if not res.data:
            return None
        return AttendanceInDB(**res.data[0])

    def delete(self, attendance_id: str) -> bool:
        res = supabase.table("attendance").delete().eq("id", attendance_id).execute()
        return len(res.data) > 0

attendance_repository = AttendanceRepository()
