// Analytics types aligned with backend schemas (app/schemas/analytics.py)

export interface DailyAttendanceStat {
  date: string;
  present: number;
  absent: number;
  late: number;
}

export interface ClassAttendanceStat {
  classId: string;
  className: string;
  attendancePercentage: number;
}

export interface DashboardAnalytics {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  attendancePercentage: number;
  activeClasses: number;
  trend: DailyAttendanceStat[];
}
