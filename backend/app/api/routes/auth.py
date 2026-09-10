from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.auth import LoginRequest, Token, UserInfo
from app.schemas.user import UserInDB
from app.api.deps import get_current_user
from app.db.supabase import supabase

router = APIRouter()

@router.post("/login", response_model=Token)
def login(request: LoginRequest):
    try:
        # Authenticate with Supabase
        auth_response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        if not auth_response.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
        return Token(access_token=auth_response.session.access_token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

@router.get("/me", response_model=UserInfo)
def get_me(current_user: UserInDB = Depends(get_current_user)):
    return UserInfo(
        id=str(current_user.id),
        email=current_user.email,
        role=current_user.role,
        full_name=current_user.full_name
    )

@router.post("/logout")
def logout(current_user: UserInDB = Depends(get_current_user)):
    # Supabase auth handles JWT expiration, but we can call sign_out to clear session server side if needed
    try:
        supabase.auth.sign_out()
    except Exception:
        pass
    return {"status": "success", "message": "Logged out successfully"}
