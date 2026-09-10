import api from './api';
import { Student, StudentCreate, StudentUpdate } from '../types/student';

export const studentService = {
  getAll: async (): Promise<Student[]> => {
    return api.get<Student[]>('/students');
  },

  getById: async (id: string): Promise<Student> => {
    return api.get<Student>(`/students/${id}`);
  },

  create: async (student: StudentCreate): Promise<Student> => {
    return api.post<Student>('/students', student);
  },

  update: async (id: string, data: StudentUpdate): Promise<Student> => {
    return api.put<Student>(`/students/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/students/${id}`);
  },

  enrollFace: async (id: string, imageBase64: string): Promise<any> => {
    return api.post(`/students/${id}/face-enrollment`, { image_base64: imageBase64 });
  },

  getFaceEnrollmentStatus: async (id: string): Promise<any> => {
    return api.get(`/students/${id}/face-enrollment`);
  },

  deleteFaceEnrollment: async (id: string): Promise<void> => {
    return api.delete(`/students/${id}/face-enrollment`);
  },
};
