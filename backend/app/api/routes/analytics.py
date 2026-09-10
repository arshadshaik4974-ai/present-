from fastapi import APIRouter, Depends
from typing import List
from app.schemas.analytics import DashboardAnalytics, ClassAttendanceStat
from app.services.analytics_service import analytics_service
from app.schemas.user import UserInDB
from app.api.deps import get_current_user, require_teacher

router = APIRouter()

@router.get("/dashboard", response_model=DashboardAnalytics)
def get_dashboard(current_user: UserInDB = Depends(require_teacher)):
    return analytics_service.get_dashboard_stats(current_user)

@router.get("/classes", response_model=List[ClassAttendanceStat])
def get_class_analytics(current_user: UserInDB = Depends(require_teacher)):
    return analytics_service.get_class_stats(current_user)
                                      