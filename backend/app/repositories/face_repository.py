from app.db.supabase import supabase
from app.schemas.face import FaceProfileInDB
from typing import Optional, List

class FaceRepository:
    def get_by_student_id(self, student_id: str) -> Optional[FaceProfileInDB]:
        res = supabase.table("student_face_profiles").select("id, student_id, enrollment_status, model_name, model_version, quality_score, enrolled_by, created_at, updated_at").eq("student_id", student_id).execute()
        if not res.data:
            return None
        return FaceProfileInDB(**res.data[0])

    def upsert_face_profile(self, student_id: str, embedding: List[float], model_name: str, model_version: str, enrolled_by: str) -> FaceProfileInDB:
        # Note: pgvector can be inserted as a simple list of floats
        data = {
            "student_id": student_id,
            "enrollment_status": "enrolled",
            "embedding": embedding,
            "model_name": model_name,
            "model_version": model_version,
            "enrolled_by": enrolled_by
        }
        # Upsert based on student_id using supabase (student_id has a unique constraint)
        # In Supabase python, we might need to handle conflict
        
        # First check if exists
        existing = supabase.table("student_face_profiles").select("id").eq("student_id", student_id).execute()
        if existing.data:
            res = supabase.table("student_face_profiles").update(data).eq("student_id", student_id).execute()
        else:
            res = supabase.table("student_face_profiles").insert(data).execute()
            
        # Refetch without embedding
        return self.get_by_student_id(student_id)

    def delete_face_profile(self, student_id: str) -> bool:
        res = supabase.table("student_face_profiles").delete().eq("student_id", student_id).execute()
        
        # Update student face_enrolled status
        supabase.table("students").update({"face_enrolled": False}).eq("id", student_id).execute()
        return len(res.data) > 0
        
    def update_student_enrolled_status(self, student_id: str, status: bool):
        supabase.table("students").update({"face_enrolled": status}).eq("id", student_id).execute()

    def get_all_enrolled_profiles_with_embeddings(self) -> List[dict]:
        # Returns raw dicts since we need the embedding array
        res = supabase.table("student_face_profiles") \
            .select("student_id, embedding, students(first_name, last_name, roll_number)") \
            .eq("enrollment_status", "enrolled") \
            .execute()
        return res.data if res.data else []

face_repository = FaceRepository()
