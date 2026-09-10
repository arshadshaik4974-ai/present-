// AI types aligned with backend schemas (app/schemas/ai.py)

export interface AIEvent {
  id: string;
  event_type: 'person_detected' | 'face_detected' | 'face_recognized' | 'unknown_person' | 'attendance_marked' | 'camera_started' | 'camera_stopped';
  camera_id: string | null;
  track_id: string | null;
  student_id: string | null;
  confidence: number | null;
  metadata: Record<string, unknown> | null;
  timestamp: string;
}

export interface AIStatus {
  status: string;
  message: string;
}

// Kept for future AI camera phase
export interface AIDetection {
  id: string;
  timestamp: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  confidence: number;
  recognizedStudentId?: string;
  status: 'recognized' | 'unknown' | 'processing';
}

export interface CameraStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  fps: number;
  lastActive: string;
}
