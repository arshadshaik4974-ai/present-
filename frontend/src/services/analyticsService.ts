import api from './api';
import { DashboardAnalytics, ClassAttendanceStat } from '../types/analytics';

export const analyticsService = {
  getDashboard: async (): Promise<DashboardAnalytics> => {
    return api.get<DashboardAnalytics>('/analytics/dashboard');
  },

  getClassStats: async (): Promise<ClassAttendanceStat[]> => {
    return api.get<ClassAttendanceStat[]>('/analytics/classes');
  },
};
