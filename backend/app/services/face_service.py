import base64
import numpy as np
import cv2
from fastapi import HTTPException
from app.repositories.face_repository import face_repository
from app.schemas.face import FaceEnrollmentResponse, FaceProfileInDB
from typing import List, Tuple
import traceback
import logging

logger = logging.getLogger(__name__)

# Lazy loading of deepface to avoid long startup times if not needed immediately
_deepface = None

def get_deepface():
    global _deepface
    if _deepface is None:
        try:
            from deepface import DeepFace
            _deepface = DeepFace
        except ImportError as e:
            logger.error(f"Failed to import DeepFace: {e}")
            raise HTTPException(status_code=500, detail="Face engine not available.")
    return _deepface

class FaceService:
    def _decode_image(self, base64_string: str) -> np.ndarray:
        try:
            if "," in base64_string:
                base64_string = base64_string.split(",")[1]
            img_data = base64.b64decode(base64_string)
            np_arr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if img is None:
                raise ValueError("Failed to decode image data")
            return img
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")

    def _validate_and_get_embedding(self, img: np.ndarray) -> Tuple[List[float], str, str]:
        df = get_deepface()
        model_name = "Facenet" # Generates 128-dimensional embeddings
        model_version = "1.0"
        
        try:
            # Enforce exactly one face
            # Deepface returns a list of dictionaries if multiple faces are found
            faces = df.extract_faces(img_path=img, detector_backend='opencv', enforce_detection=True)
            
            if len(faces) == 0:
                raise HTTPException(status_code=400, detail="No face detected. Please look directly at the camera.")
            elif len(faces) > 1:
                raise HTTPException(status_code=400, detail="Multiple faces detected. Please ensure only one person is visible.")
            
            # Simple quality check (size of face)
            face_region = faces[0]['facial_area']
            width, height = face_region['w'], face_region['h']
            if width < 100 or height < 100:
                raise HTTPException(status_code=400, detail="Face is too small. Move closer to the camera.")
            
            # Extract embedding
            objs = df.represent(img_path=img, model_name=model_name, detector_backend='opencv', enforce_detection=True)
            if len(objs) == 0:
                raise HTTPException(status_code=400, detail="Could not extract face embedding.")
                
            embedding = objs[0]["embedding"]
            
            # Basic validation of embedding
            if not embedding or len(embedding) != 128:
                raise HTTPException(status_code=500, detail=f"Invalid embedding dimension. Expected 128, got {len(embedding) if embedding else 0}")
                
            return embedding, model_name, model_version
            
        except HTTPException:
            raise
        except ValueError as e:
            # Deepface raises ValueError if no face is detected when enforce_detection=True
            if "Face could not be detected" in str(e):
                raise HTTPException(status_code=400, detail="No face detected. Please ensure your face is clearly visible.")
            raise HTTPException(status_code=400, detail=f"Face detection failed: {str(e)}")
        except Exception as e:
            logger.error(f"Error during face embedding: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail="Failed to process face image")

    def enroll_face(self, student_id: str, base64_image: str, current_user_id: str) -> FaceEnrollmentResponse:
        img = self._decode_image(base64_image)
        
        # 1. Generate embedding
        embedding, model_name, model_version = self._validate_and_get_embedding(img)
        
        # 2. Store in DB
        try:
            profile = face_repository.upsert_face_profile(
                student_id=student_id,
                embedding=embedding,
                model_name=model_name,
                model_version=model_version,
                enrolled_by=current_user_id
            )
            
            # 3. Update student status
            face_repository.update_student_enrolled_status(student_id, True)
            
            return FaceEnrollmentResponse(
                status="success",
                student_id=student_id,
                face_profile=profile,
                message="Face enrolled successfully"
            )
        except Exception as e:
            logger.error(f"Database error during enrollment: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail="Failed to save face profile")

    def get_enrollment_status(self, student_id: str) -> FaceProfileInDB:
        profile = face_repository.get_by_student_id(student_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Face profile not found")
        return profile

    def delete_enrollment(self, student_id: str):
        if not face_repository.delete_face_profile(student_id):
            raise HTTPException(status_code=404, detail="Face profile not found")

face_service = FaceService()
