// Attendance types aligned with backend schemas (app/schemas/attendance.py)

export interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  source: 'manual' | 'teacher' | 'ai';
  check_in_time: string | null;
  check_out_time: string | null;
  confidence: number | null;
  created_at: string;
}

export interface AttendanceCreate {
  student_id: string;
  class_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  source: 'manual' | 'teacher' | 'ai';
  check_in_time?: string;
  check_out_time?: string;
  confidence?: number;
}

export interface AttendanceUpdate {
  status?: 'present' | 'absent' | 'late' | 'excused';
  source?: 'manual' | 'teacher' | 'ai';
  check_in_time?: string;
  check_out_time?: string;
  confidence?: number;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  total: number;
  percentage: number;
}
