import api from './api';
import { AttendanceRecord, AttendanceCreate, AttendanceUpdate } from '../types/attendance';

export const attendanceService = {
  getAll: async (): Promise<AttendanceRecord[]> => {
    return api.get<AttendanceRecord[]>('/attendance');
  },

  getById: async (id: string): Promise<AttendanceRecord> => {
    return api.get<AttendanceRecord>(`/attendance/${id}`);
  },

  create: async (attendance: AttendanceCreate): Promise<AttendanceRecord> => {
    return api.post<AttendanceRecord>('/attendance', attendance);
  },

  update: async (id: string, data: AttendanceUpdate): Promise<AttendanceRecord> => {
    return api.put<AttendanceRecord>(`/attendance/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/attendance/${id}`);
  },

  // Sessions
  getActiveSessions: async (): Promise<any[]> => {
    return api.get<any[]>('/attendance/sessions/active');
  },

  startSession: async (class_id: string): Promise<any> => {
    return api.post<any>('/attendance/sessions', { class_id });
  },

  endSession: async (session_id: string): Promise<any> => {
    return api.put<any>(`/attendance/sessions/${session_id}/end`, {});
  },
};
