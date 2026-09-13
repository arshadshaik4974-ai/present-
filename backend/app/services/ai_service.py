import base64
import numpy as np
import cv2
import time
import logging
import traceback
import asyncio
import threading
from typing import List, Dict, Optional, Tuple
from collections import deque
from datetime import date
from fastapi import HTTPException
from app.repositories.ai_event_repository import ai_event_repository
from app.repositories.face_repository import face_repository
from app.repositories.camera_repository import camera_repository
from app.schemas.ai import AIEventCreate, AIEventInDB
from app.services.attendance_service import attendance_service
from app.schemas.attendance import AttendanceCreate
from app.websocket.manager import manager
import json

logger = logging.getLogger(__name__)

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

class AIService:
    def __init__(self):
        self.status = "not_initialized"
        self.enrolled_profiles_cache = []
        self.last_cache_update = 0
        self.CACHE_TTL = 30  # seconds
        self.SIMILARITY_THRESHOLD = 0.60
        
        # Buffer for stabilization: map of student_id -> deque of recent hits
        self.recent_recognitions = deque(maxlen=4) 
        
        self.rtsp_task = None
        self.stop_rtsp_flag = False

    def get_status(self) -> Dict[str, str]:
        return {"status": self.status, "message": "AI Engine is ready"}

    def start_engine(self) -> Dict[str, str]:
        self.status = "running"
        ai_event_repository.create(AIEventCreate(event_type="camera_started", camera_id="SYSTEM"))
        # Preload model
        try:
            get_deepface()
        except Exception:
            pass
        return {"status": self.status}

    def stop_engine(self) -> Dict[str, str]:
        self.status = "stopped"
        ai_event_repository.create(AIEventCreate(event_type="camera_stopped", camera_id="SYSTEM"))
        return {"status": self.status}

    def get_recent_events(self) -> List[AIEventInDB]:
        return ai_event_repository.get_recent(limit=50)
        
    async def _rtsp_loop(self, rtsp_url: str):
        cap = cv2.VideoCapture(rtsp_url)
        if not cap.isOpened():
            logger.error(f"Failed to open RTSP stream: {rtsp_url}")
            await manager.broadcast(json.dumps({"type": "ERROR", "message": "Failed to connect to CCTV"}))
            return

        fps_delay = 1.0 / 2.0  # target 2 fps for processing
        
        while not self.stop_rtsp_flag:
            start_time = time.time()
            ret, frame = await asyncio.to_thread(cap.read)
            if not ret:
                logger.error("Failed to read frame from RTSP stream")
                break
                
            # Resize frame to reduce processing time and bandwidth (e.g., 640x480)
            frame = cv2.resize(frame, (640, 480))
            
            # Encode frame to base64 for frontend display
            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            base64_image = base64.b64encode(buffer).decode('utf-8')
            
            # Send raw frame to frontend first so it updates smoothly
            await manager.broadcast(json.dumps({
                "type": "RTSP_FRAME",
                "image": f"data:image/jpeg;base64,{base64_image}"
            }))
            
            # Process frame for faces
            result = await asyncio.to_thread(self.process_frame, base64_image)
            
            # Broadcast recognition result
            await manager.broadcast(json.dumps(result))
            
            # Delay to maintain target FPS
            elapsed = time.time() - start_time
            sleep_time = max(0, fps_delay - elapsed)
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)
                
        cap.release()
        logger.info("RTSP loop stopped")

    async def start_rtsp(self, camera_id: str) -> Dict[str, str]:
        if self.rtsp_task and not self.stop_rtsp_flag:
            return {"status": "already_running"}
            
        camera = await asyncio.to_thread(camera_repository.get_by_id, camera_id)
        if not camera:
            raise HTTPException(status_code=404, detail="Camera not found")
            
        self.status = "running"
        self.stop_rtsp_flag = False
        
        # Preload model
        try:
            await asyncio.to_thread(get_deepface)
        except Exception:
            pass
            
        self.rtsp_task = asyncio.create_task(self._rtsp_loop(camera.rtsp_url))
        ai_event_repository.create(AIEventCreate(event_type="camera_started", camera_id=camera_id))
        return {"status": "started"}

    async def stop_rtsp(self) -> Dict[str, str]:
        self.stop_rtsp_flag = True
        if self.rtsp_task:
            # Let it terminate gracefully
            pass
        self.status = "stopped"
        ai_event_repository.create(AIEventCreate(event_type="camera_stopped", camera_id="RTSP"))
        return {"status": "stopped"}

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
            raise ValueError(f"Invalid image data: {str(e)}")

    def _refresh_cache_if_needed(self):
        now = time.time()
        if now - self.last_cache_update > self.CACHE_TTL:
            self.enrolled_profiles_cache = face_repository.get_all_enrolled_profiles_with_embeddings()
            self.last_cache_update = now

    def _cosine_similarity(self, a, b):
        a = np.array(a)
        b = np.array(b)
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

    def _find_best_match(self, embedding: List[float]) -> Tuple[Optional[dict], float]:
        self._refresh_cache_if_needed()
        if not self.enrolled_profiles_cache:
            return None, 0.0
            
        best_match = None
        highest_similarity = -1.0
        
        for profile in self.enrolled_profiles_cache:
            db_embedding = profile.get("embedding")
            if not db_embedding:
                continue
            
            sim = self._cosine_similarity(embedding, db_embedding)
            if sim > highest_similarity:
                highest_similarity = sim
                best_match = profile
                
        return best_match, highest_similarity
        
    def _handle_attendance(self, student_id: str, student_name: str, class_id: str):
        try:
            attendance = AttendanceCreate(
                student_id=student_id,
                class_id=class_id,
                date=date.today(),
                status="present",
                source="ai"
            )
            # Create attendance record via service (bypassing user check by not passing current_user)
            # We don't have current_user here, but it's an AI source so we skip authorization check
            # attendance_service.create() accepts None for current_user
            attendance_service.create(attendance, current_user=None)
            
            # Record AI Event
            ai_event_repository.create(AIEventCreate(
                event_type="attendance_marked", 
                camera_id="SYSTEM",
                student_id=student_id
            ))
            
            return {
                "type": "ATTENDANCE_MARKED",
                "message": "Attendance marked successfully",
                "student_name": student_name,
                "student_id": student_id
            }
        except HTTPException as e:
            if e.status_code == 409:
                return {
                    "type": "ATTENDANCE_ALREADY_MARKED",
                    "message": "Already marked present today",
                    "student_name": student_name,
                    "student_id": student_id
                }
            return {"type": "ERROR", "message": str(e.detail)}
        except Exception as e:
            logger.error(f"Error handling attendance: {traceback.format_exc()}")
            return {"type": "ERROR", "message": "Failed to mark attendance"}

    def process_frame(self, base64_image: str) -> dict:
        start_time = time.time()
        try:
            img = self._decode_image(base64_image)
            df = get_deepface()
            
            # Detect face
            faces = df.extract_faces(img_path=img, detector_backend='opencv', enforce_detection=False)
            
            if not faces or len(faces) == 0:
                self.recent_recognitions.append(None)
                return {"type": "NO_FACE", "message": "No face detected"}
            
            valid_faces = [f for f in faces if f.get("confidence", 1.0) > 0.5]
            
            if len(valid_faces) == 0:
                self.recent_recognitions.append(None)
                return {"type": "NO_FACE", "message": "No face detected"}
            if len(valid_faces) > 1:
                self.recent_recognitions.append(None)
                return {"type": "MULTIPLE_FACES", "message": "Multiple faces detected"}
                
            face_region = valid_faces[0]['facial_area']
            width, height = face_region['w'], face_region['h']
            
            if width < 100 or height < 100:
                self.recent_recognitions.append(None)
                return {"type": "FACE_LOW_QUALITY", "message": "Face quality too low (move closer)"}
                
            objs = df.represent(img_path=img, model_name="Facenet", detector_backend='opencv', enforce_detection=False)
            if not objs or len(objs) == 0:
                self.recent_recognitions.append(None)
                return {"type": "PROCESSING_ERROR", "message": "Failed to extract embedding"}
                 
            embedding = objs[0]["embedding"]
            best_match, similarity = self._find_best_match(embedding)
            
            processing_time_ms = int((time.time() - start_time) * 1000)
            
            if best_match and similarity >= self.SIMILARITY_THRESHOLD:
                student_id = best_match["student_id"]
                student_data = best_match.get("students", {})
                student_name = f"{student_data.get('first_name', '')} {student_data.get('last_name', '')}".strip()
                
                self.recent_recognitions.append(student_id)
                
                base_event = {
                    "type": "FACE_RECOGNIZED",
                    "student_id": student_id,
                    "student_name": student_name,
                    "similarity": float(similarity),
                    "timestamp": time.time(),
                    "processing_time_ms": processing_time_ms
                }
                
                # Check for stable recognition (last 3 recognitions are the same student)
                if list(self.recent_recognitions).count(student_id) >= 3:
                    # We have a stable recognition. Let's see if there's an active session for their class.
                    # In a real app we'd look up the student's class, but `best_match` doesn't have class_id natively.
                    # We need to fetch the student's class_id.
                    from app.repositories.student_repository import student_repository
                    student = student_repository.get_by_id(student_id)
                    if student and student.class_id:
                        class_id = str(student.class_id)
                        from app.repositories.attendance_session_repository import attendance_session_repository
                        active_session = attendance_session_repository.get_active_by_class(class_id)
                        
                        if active_session:
                            # Active session found, mark attendance
                            att_res = self._handle_attendance(student_id, student_name, class_id)
                            base_event["attendance"] = att_res
                        else:
                            base_event["attendance"] = {
                                "type": "NO_ACTIVE_SESSION",
                                "message": "No active attendance session for this student's class."
                            }
                
                return base_event
            else:
                self.recent_recognitions.append(None)
                return {
                    "type": "FACE_UNKNOWN",
                    "message": "Unknown person",
                    "processing_time_ms": processing_time_ms
                }
                
        except ValueError as e:
            if "Face could not be detected" in str(e):
                self.recent_recognitions.append(None)
                return {"type": "NO_FACE", "message": "No face detected"}
            self.recent_recognitions.append(None)
            return {"type": "PROCESSING_ERROR", "message": str(e)}
        except Exception as e:
            logger.error(f"Error processing frame: {traceback.format_exc()}")
            self.recent_recognitions.append(None)
            return {"type": "RECOGNITION_ERROR", "message": "Internal processing error"}

ai_service = AIService()
