import api, { setStoredToken, clearStoredToken, getStoredToken } from './api';
import { LoginResponse, User } from '../types/auth';

export const authService = {
  /**
   * Authenticate with the backend via Supabase Auth.
   * Stores the JWT token in localStorage on success.
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
      '/auth/login',
      { email, password },
      { skipAuth: true }
    );
    setStoredToken(response.access_token);
    return response;
  },

  /**
   * Sign out and clear stored credentials.
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Even if backend logout fails, clear local state
    }
    clearStoredToken();
  },

  /**
   * Fetch the currently authenticated user's profile.
   */
  async getCurrentUser(): Promise<User> {
    return api.get<User>('/auth/me');
  },

  /**
   * Check if a token exists in localStorage.
   */
  isAuthenticated(): boolean {
    return !!getStoredToken();
  },
};
