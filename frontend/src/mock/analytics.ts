// Mock analytics data — kept for development reference only.
// NOT imported by any production service.

import { DailyAttendanceStat, ClassAttendanceStat } from '../types/analytics';

export const mockDailyStats: DailyAttendanceStat[] = [
  { date: '2026-09-03', present: 850, absent: 30, late: 20 },
  { date: '2026-09-04', present: 860, absent: 25, late: 15 },
  { date: '2026-09-05', present: 840, absent: 40, late: 20 },
  { date: '2026-09-06', present: 870, absent: 20, late: 10 },
  { date: '2026-09-07', present: 880, absent: 15, late: 5 },
  { date: '2026-09-08', present: 865, absent: 25, late: 10 },
  { date: '2026-09-09', present: 855, absent: 30, late: 15 },
];

export const mockClassStats: ClassAttendanceStat[] = [
  { classId: 'c1', className: '10 A', attendancePercentage: 95 },
  { classId: 'c2', className: '10 B', attendancePercentage: 92 },
  { classId: 'c3', className: '11 Sci', attendancePercentage: 98 },
  { classId: 'c4', className: '11 Com', attendancePercentage: 90 },
  { classId: 'c5', className: '12 Sci', attendancePercentage: 88 },
];
