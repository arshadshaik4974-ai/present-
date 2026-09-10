from app.db.supabase import supabase
from app.schemas.student import StudentCreate, StudentUpdate, StudentInDB
from typing import List, Optional

class StudentRepository:
    def get_all(self) -> List[StudentInDB]:
        res = supabase.table("students").select("*").execute()
        return [StudentInDB(**item) for item in res.data]

    def get_by_id(self, student_id: str) -> Optional[StudentInDB]:
        res = supabase.table("students").select("*").eq("id", student_id).execute()
        if not res.data:
            return None
        return StudentInDB(**res.data[0])
    
    def get_by_class_id(self, class_id: str) -> List[StudentInDB]:
        res = supabase.table("students").select("*").eq("class_id", class_id).execute()
        return [StudentInDB(**item) for item in res.data]

    def get_by_class_ids(self, class_ids: List[str]) -> List[StudentInDB]:
        if not class_ids:
            return []
        res = supabase.table("students").select("*").in_("class_id", class_ids).execute()
        return [StudentInDB(**item) for item in res.data]

    def create(self, student: StudentCreate) -> StudentInDB:
        # Convert UUID to string if necessary, but Supabase python client handles dicts
        data = student.model_dump(exclude_none=True)
        if 'class_id' in data and data['class_id'] is not None:
            data['class_id'] = str(data['class_id'])
            
        res = supabase.table("students").insert(data).execute()
        return StudentInDB(**res.data[0])

    def update(self, student_id: str, student: StudentUpdate) -> Optional[StudentInDB]:
        data = student.model_dump(exclude_none=True)
        if 'class_id' in data and data['class_id'] is not None:
            data['class_id'] = str(data['class_id'])
            
        if not data:
            return self.get_by_id(student_id)
            
        res = supabase.table("students").update(data).eq("id", student_id).execute()
        if not res.data:
            return None
        return StudentInDB(**res.data[0])

    def delete(self, student_id: str) -> bool:
        res = supabase.table("students").delete().eq("id", student_id).execute()
        return len(res.data) > 0

student_repository = StudentRepository()
