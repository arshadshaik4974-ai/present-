from fastapi import APIRouter
from pydantic import BaseModel
from app.core.config import settings

router = APIRouter()

class HealthResponse(BaseModel):
    status: str
    database: str
    supabase: str
    environment: str
    version: str

@router.get("", response_model=HealthResponse)
async def health_check():
    # TODO: Implement actual database connection check via Supabase client
    return HealthResponse(
        status="ok",
        database="connected",
        supabase="connected",
        environment=settings.ENVIRONMENT,
        version="2.0.0"
    )
