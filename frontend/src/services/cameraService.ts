import api from './api';

export interface Camera {
  id: string;
  name: string;
  rtsp_url: string;
  location?: string;
  status: string;
  created_at: string;
}

export const cameraService = {
  getAll: async (): Promise<Camera[]> => {
    return api.get<Camera[]>('/cameras');
  },

  getById: async (id: string): Promise<Camera> => {
    return api.get<Camera>(`/cameras/${id}`);
  },

  create: async (data: Partial<Camera>): Promise<Camera> => {
    return api.post<Camera>('/cameras', data);
  },

  update: async (id: string, data: Partial<Camera>): Promise<Camera> => {
    return api.put<Camera>(`/cameras/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/cameras/${id}`);
  }
};
