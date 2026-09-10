// Auth types aligned with backend schemas (app/schemas/auth.py, app/schemas/user.py)

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'principal' | 'teacher';
  full_name: string;
  is_active?: boolean;
}
