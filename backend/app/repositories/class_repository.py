from app.db.supabase import supabase
from app.schemas.class_schema import ClassCreate, ClassUpdate, ClassInDB
from typing import List, Optional

class ClassRepository:
    def get_all(self) -> List[ClassInDB]:
        res = supabase.table("classes").select("*").execute()
        return [ClassInDB(**item) for item in res.data]

    def get_by_id(self, class_id: str) -> Optional[ClassInDB]:
        res = supabase.table("classes").select("*").eq("id", class_id).execute()
        if not res.data:
            return None
        return ClassInDB(**res.data[0])

    def get_by_teacher_id(self, teacher_id: str) -> List[ClassInDB]:
        res = supabase.table("classes").select("*").eq("teacher_id", teacher_id).execute()
        return [ClassInDB(**item) for item in res.data]

    def create(self, class_obj: ClassCreate) -> ClassInDB:
        data = class_obj.model_dump(exclude_none=True)
        if 'teacher_id' in data and data['teacher_id'] is not None:
            data['teacher_id'] = str(data['teacher_id'])
            
        res = supabase.table("classes").insert(data).execute()
        return ClassInDB(**res.data[0])

    def update(self, class_id: str, class_obj: ClassUpdate) -> Optional[ClassInDB]:
        data = class_obj.model_dump(exclude_none=True)
        if 'teacher_id' in data and data['teacher_id'] is not None:
            data['teacher_id'] = str(data['teacher_id'])
            
        if not data:
            return self.get_by_id(class_id)
            
        res = supabase.table("classes").update(data).eq("id", class_id).execute()
        if not res.data:
            return None
        return ClassInDB(**res.data[0])

    def delete(self, class_id: str) -> bool:
        res = supabase.table("classes").delete().eq("id", class_id).execute()
        return len(res.data) > 0

class_repository = ClassRepository()
