import api from './api';
import { Teacher, TeacherCreate, TeacherUpdate } from '../types/teacher';

export const teacherService = {
  getAll: async (): Promise<Teacher[]> => {
    return api.get<Teacher[]>('/teachers');
  },

  getById: async (id: string): Promise<Teacher> => {
    return api.get<Teacher>(`/teachers/${id}`);
  },

  create: async (teacher: TeacherCreate): Promise<Teacher> => {
    return api.post<Teacher>('/teachers', teacher);
  },

  update: async (id: string, data: TeacherUpdate): Promise<Teacher> => {
    return api.put<Teacher>(`/teachers/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/teachers/${id}`);
  },
};
