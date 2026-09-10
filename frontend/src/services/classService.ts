import api from './api';
import { Class, ClassCreate, ClassUpdate } from '../types/class';

export const classService = {
  getAll: async (): Promise<Class[]> => {
    return api.get<Class[]>('/classes');
  },

  getById: async (id: string): Promise<Class> => {
    return api.get<Class>(`/classes/${id}`);
  },

  create: async (classData: ClassCreate): Promise<Class> => {
    return api.post<Class>('/classes', classData);
  },

  update: async (id: string, data: ClassUpdate): Promise<Class> => {
    return api.put<Class>(`/classes/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/classes/${id}`);
  },
};
