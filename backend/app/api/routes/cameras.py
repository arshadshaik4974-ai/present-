from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.schemas.camera import CameraCreate, CameraUpdate, CameraInDB
from app.repositories.camera_repository import camera_repository
from app.schemas.user import UserInDB
from app.api.deps import require_admin, require_principal

router = APIRouter()

@router.get("", response_model=List[CameraInDB])
def read_cameras(current_user: UserInDB = Depends(require_principal)):
    return camera_repository.get_all()

@router.get("/{camera_id}", response_model=CameraInDB)
def read_camera(camera_id: str, current_user: UserInDB = Depends(require_principal)):
    camera = camera_repository.get_by_id(camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return camera

@router.post("", response_model=CameraInDB, status_code=201)
def create_camera(camera: CameraCreate, current_user: UserInDB = Depends(require_admin)):
    return camera_repository.create(camera)

@router.put("/{camera_id}", response_model=CameraInDB)
def update_camera(camera_id: str, camera: CameraUpdate, current_user: UserInDB = Depends(require_admin)):
    updated = camera_repository.update(camera_id, camera)
    if not updated:
        raise HTTPException(status_code=404, detail="Camera not found")
    return updated

@router.delete("/{camera_id}", status_code=204)
def delete_camera(camera_id: str, current_user: UserInDB = Depends(require_admin)):
    if not camera_repository.delete(camera_id):
        raise HTTPException(status_code=404, detail="Camera not found")
    return None
