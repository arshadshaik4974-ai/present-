from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict
from app.schemas.ai import AIEventInDB
from app.services.ai_service import ai_service
from app.schemas.user import UserInDB
from app.api.deps import get_current_user, require_admin, require_teacher

router = APIRouter()

@router.get("/status")
def get_ai_status(current_user: UserInDB = Depends(require_teacher)) -> Dict[str, str]:
    return ai_service.get_status()

@router.post("/start")
def start_ai(current_user: UserInDB = Depends(require_admin)):
    return ai_service.start_engine()

@router.post("/stop")
def stop_ai(current_user: UserInDB = Depends(require_admin)):
    return ai_service.stop_engine()

@router.post("/restart")
def restart_ai(current_user: UserInDB = Depends(require_admin)):
    ai_service.stop_engine()
    return ai_service.start_engine()

@router.get("/events", response_model=List[AIEventInDB])
def get_recent_events(current_user: UserInDB = Depends(require_teacher)):
    return ai_service.get_recent_events()
