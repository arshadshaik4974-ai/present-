from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.db.supabase import supabase
from app.schemas.auth import UserInfo
from app.repositories.user_repository import user_repository
from app.schemas.user import UserInDB

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserInDB:
    token = credentials.credentials
    try:
        # Validate token via Supabase Auth
        # This will throw an error if the token is invalid or expired
        user_resp = supabase.auth.get_user(token)
        if not user_resp or not user_resp.user:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        supabase_user_id = user_resp.user.id
        
        # Load application profile
        app_user = user_repository.get_by_id(supabase_user_id)
        if not app_user:
            # If application profile doesn't exist, we might want to auto-create it or return error.
            # Assuming the profile is created via trigger or signup flow.
            raise HTTPException(status_code=401, detail="User profile not found")
            
        if not app_user.is_active:
            raise HTTPException(status_code=403, detail="Inactive user")
            
        return app_user

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def require_principal(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
    if current_user.role != "principal":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    return current_user

def require_admin(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
    if current_user.role not in ["principal", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    return current_user

def require_teacher(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
    if current_user.role not in ["principal", "admin", "teacher"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    return current_user
