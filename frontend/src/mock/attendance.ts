// Mock attendance data — kept for development reference only.
// NOT imported by any production service.

import { AttendanceRecord } from '../types/attendance';

export const mockAttendance: AttendanceRecord[] = [
  { id: 'a1', student_id: 's1', class_id: 'c1', date: '2026-09-09', status: 'present', source: 'ai', check_in_time: '2026-09-09T08:15:00Z', check_out_time: null, confidence: 0.98, created_at: '2026-09-09T08:15:00Z' },
  { id: 'a2', student_id: 's2', class_id: 'c1', date: '2026-09-09', status: 'late', source: 'ai', check_in_time: '2026-09-09T08:45:00Z', check_out_time: null, confidence: 0.95, created_at: '2026-09-09T08:45:00Z' },
  { id: 'a3', student_id: 's3', class_id: 'c2', date: '2026-09-09', status: 'absent', source: 'manual', check_in_time: null, check_out_time: null, confidence: null, created_at: '2026-09-09T09:00:00Z' },
];
