from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.api.deps import require_admin
from app.schemas.user import UserInDB, UserCreate, UserUpdate
from app.repositories.user_repository import user_repository

router = APIRouter()

@router.get("/users", response_model=List[UserInDB])
def get_users(current_user: UserInDB = Depends(require_admin)):
    """Get all users. Only accessible by admins."""
    return user_repository.get_all()

@router.get("/users/{user_id}", response_model=UserInDB)
def get_user(user_id: str, current_user: UserInDB = Depends(require_admin)):
    """Get a user by ID. Only accessible by admins."""
    user = user_repository.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/users", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, current_user: UserInDB = Depends(require_admin)):
    """Create a new user. Only accessible by admins. 
    Note: Real app needs to sync this with Supabase Auth or rely on trigger."""
    existing_user = user_repository.get_by_email(user_in.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # In a full implementation, this should create the user in Supabase Auth via admin API first.
    return user_repository.create(user_in)

@router.patch("/users/{user_id}", response_model=UserInDB)
def update_user(user_id: str, user_update: UserUpdate, current_user: UserInDB = Depends(require_admin)):
    """Update user role or active status. Only accessible by admins."""
    user = user_repository.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_update.model_dump(exclude_unset=True)
    if not update_data:
        return user
        
    return user_repository.update(user_id, update_data)

@router.get("/audit-logs")
def get_audit_logs(current_user: UserInDB = Depends(require_admin)):
    """Get audit logs. Only accessible by admins."""
    from app.db.supabase import supabase
    res = supabase.table("admin_audit_logs").select("*").order("created_at", desc=True).limit(100).execute()
    return res.data

