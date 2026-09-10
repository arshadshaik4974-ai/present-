from app.db.supabase import supabase
from app.schemas.user import UserCreate, UserInDB
from typing import List, Optional

class UserRepository:
    def get_by_email(self, email: str) -> Optional[UserInDB]:
        res = supabase.table("users").select("*").eq("email", email).execute()
        if not res.data:
            return None
        return UserInDB(**res.data[0])

    def get_by_id(self, user_id: str) -> Optional[UserInDB]:
        res = supabase.table("users").select("*").eq("id", user_id).execute()
        if not res.data:
            return None
        return UserInDB(**res.data[0])

    def get_all(self) -> List[UserInDB]:
        res = supabase.table("users").select("*").order("created_at", desc=True).execute()
        return [UserInDB(**user) for user in res.data]
    
    def create(self, user_in: UserCreate) -> UserInDB:
        res = supabase.table("users").insert(user_in.model_dump()).execute()
        return UserInDB(**res.data[0])
    
    def update(self, user_id: str, data: dict) -> UserInDB:
        res = supabase.table("users").update(data).eq("id", user_id).execute()
        return UserInDB(**res.data[0])

user_repository = UserRepository()
