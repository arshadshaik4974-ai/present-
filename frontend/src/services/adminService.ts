import { api } from './api';
import { User } from '../types/auth';

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: any;
  ip_address: string;
  created_at: string;
}

export const adminService = {
  getUsers: () => api.get<User[]>('/admin/users'),
  
  createUser: (data: Partial<User>) => api.post<User>('/admin/users', data),
  
  updateUserRole: (id: string, role: string) => 
    api.patch<User>(`/admin/users/${id}`, { role }),
    
  updateUserStatus: (id: string, is_active: boolean) => 
    api.patch<User>(`/admin/users/${id}`, { is_active }),
    
  getAuditLogs: () => api.get<AuditLog[]>('/admin/audit-logs'),
};
