import { AIDetection, CameraStatus } from '../types/ai';

export const mockCameras: CameraStatus[] = [
  { id: 'cam1', name: 'Main Gate Entrance', status: 'online', fps: 30, lastActive: new Date().toISOString() },
  { id: 'cam2', name: 'Hallway Block A', status: 'online', fps: 24, lastActive: new Date().toISOString() },
  { id: 'cam3', name: 'Library Entrance', status: 'offline', fps: 0, lastActive: '2026-09-08T10:00:00Z' },
];

export const mockDetections: AIDetection[] = [
  { id: 'd1', timestamp: new Date().toISOString(), boundingBox: { x: 100, y: 150, width: 200, height: 250 }, confidence: 0.98, recognizedStudentId: 's1', status: 'recognized' },
  { id: 'd2', timestamp: new Date(Date.now() - 5000).toISOString(), boundingBox: { x: 300, y: 120, width: 180, height: 220 }, confidence: 0.95, recognizedStudentId: 's2', status: 'recognized' },
  { id: 'd3', timestamp: new Date(Date.now() - 10000).toISOString(), boundingBox: { x: 50, y: 80, width: 210, height: 260 }, confidence: 0.45, status: 'unknown' },
];
