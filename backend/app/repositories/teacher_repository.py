from app.db.supabase import supabase
from app.schemas.teacher import TeacherCreate, TeacherUpdate, TeacherInDB
from typing import List, Optional

class TeacherRepository:
    def get_all(self) -> List[TeacherInDB]:
        res = supabase.table("teachers").select("*").execute()
        return [TeacherInDB(**item) for item in res.data]

    def get_by_id(self, teacher_id: str) -> Optional[TeacherInDB]:
        res = supabase.table("teachers").select("*").eq("id", teacher_id).execute()
        if not res.data:
            return None
        return TeacherInDB(**res.data[0])

    def get_by_email(self, email: str) -> Optional[TeacherInDB]:
        res = supabase.table("teachers").select("*").eq("email", email).execute()
        if not res.data:
            return None
        return TeacherInDB(**res.data[0])

    def create(self, teacher: TeacherCreate) -> TeacherInDB:
        data = teacher.model_dump(exclude_none=True)
        res = supabase.table("teachers").insert(data).execute()
        return TeacherInDB(**res.data[0])

    def update(self, teacher_id: str, teacher: TeacherUpdate) -> Optional[TeacherInDB]:
        data = teacher.model_dump(exclude_none=True)
        if not data:
            return self.get_by_id(teacher_id)
            
        res = supabase.table("teachers").update(data).eq("id", teacher_id).execute()
        if not res.data:
            return None
        return TeacherInDB(**res.data[0])

    def delete(self, teacher_id: str) -> bool:
        res = supabase.table("teachers").delete().eq("id", teacher_id).execute()
        return len(res.data) > 0

teacher_repository = TeacherRepository()
