import api from './api';
import { AIStatus, AIEvent } from '../types/ai';

export const aiService = {
  getStatus: async (): Promise<AIStatus> => {
    return api.get<AIStatus>('/ai/status');
  },

  start: async (): Promise<AIStatus> => {
    return api.post<AIStatus>('/ai/start');
  },

  stop: async (): Promise<AIStatus> => {
    return api.post<AIStatus>('/ai/stop');
  },

  restart: async (): Promise<AIStatus> => {
    return api.post<AIStatus>('/ai/restart');
  },

  getEvents: async (): Promise<AIEvent[]> => {
    return api.get<AIEvent[]>('/ai/events');
  },
};
