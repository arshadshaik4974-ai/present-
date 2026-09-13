from fastapi import FastAPI, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.api.routes import health, auth, students, teachers, classes, attendance, analytics, ai, admin, cameras
from app.websocket import events
import os

app = FastAPI(
    title="AI Attendance V2 API",
    description="Backend API for AI Attendance V2 system powered by FastAPI and Supabase.",
    version="2.0.0"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api/v1")

# Include routes
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(students.router, prefix="/students", tags=["students"])
api_router.include_router(teachers.router, prefix="/teachers", tags=["teachers"])
api_router.include_router(classes.router, prefix="/classes", tags=["classes"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["attendance"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(cameras.router, prefix="/cameras", tags=["cameras"])

app.include_router(api_router)
app.include_router(events.router, prefix="/ws", tags=["websocket"])

# --- Serve React Frontend ---
# The frontend build output (frontend/dist) is served as static files.
# This allows both API and UI to run from a single URL.
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist")

if os.path.isdir(FRONTEND_DIR):
    # Serve static assets (JS, CSS, images) under /assets
    assets_dir = os.path.join(FRONTEND_DIR, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Serve other static files (favicon, etc.)
    @app.get("/favicon.svg")
    @app.get("/favicon.ico")
    async def favicon():
        fav = os.path.join(FRONTEND_DIR, "favicon.svg")
        if os.path.isfile(fav):
            return FileResponse(fav)
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

    # Catch-all: serve index.html for any non-API route (SPA routing)
    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        # Don't intercept API or WebSocket routes
        if full_path.startswith("api/") or full_path.startswith("ws/") or full_path == "docs" or full_path == "openapi.json":
            return None
        
        # Try to serve static file first
        file_path = os.path.join(FRONTEND_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # Fallback to index.html for SPA client-side routing
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
else:
    @app.get("/")
    def root():
        return {"message": "Welcome to AI Attendance V2 API. See /docs for documentation. Frontend not built yet — run 'npm run build' in frontend/."}

