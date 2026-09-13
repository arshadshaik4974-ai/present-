from app.db.supabase import supabase
from app.schemas.camera import CameraCreate, CameraUpdate, CameraInDB
from typing import List, Optional

class CameraRepository:
    def get_all(self) -> List[CameraInDB]:
        res = supabase.table("cameras").select("*").execute()
        return [CameraInDB(**item) for item in res.data]

    def get_by_id(self, camera_id: str) -> Optional[CameraInDB]:
        res = supabase.table("cameras").select("*").eq("id", camera_id).execute()
        if not res.data:
            return None
        return CameraInDB(**res.data[0])

    def create(self, camera: CameraCreate) -> CameraInDB:
        data = camera.model_dump(exclude_none=True)
        res = supabase.table("cameras").insert(data).execute()
        return CameraInDB(**res.data[0])

    def update(self, camera_id: str, camera: CameraUpdate) -> Optional[CameraInDB]:
        data = camera.model_dump(exclude_none=True)
        if not data:
            return self.get_by_id(camera_id)
            
        res = supabase.table("cameras").update(data).eq("id", camera_id).execute()
        if not res.data:
            return None
        return CameraInDB(**res.data[0])

    def delete(self, camera_id: str) -> bool:
        res = supabase.table("cameras").delete().eq("id", camera_id).execute()
        return len(res.data) > 0

camera_repository = CameraRepository()
