/**
 * Central API Client
 * 
 * All HTTP communication with the FastAPI backend goes through this module.
 * No other file should call fetch() directly.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:8000/api/v1');
const REQUEST_TIMEOUT_MS = 15000;

// ─── Error Types ────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

export class NetworkError extends Error {
  constructor(message = 'Cannot connect to the backend server. Please check that the backend is running.') {
    super(message);
    this.name = 'NetworkError';
  }
}

// ─── Token Management ───────────────────────────────────────────────────────

const TOKEN_KEY = 'auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── Core Request Function ──────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: { skipAuth?: boolean }
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Attach auth token if available
  if (!options?.skipAuth) {
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new NetworkError('Request timed out. The server may be slow or unavailable.');
    }
    throw new NetworkError();
  } finally {
    clearTimeout(timeoutId);
  }

  // Handle non-OK responses
  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;

    try {
      const errorBody = await response.json();
      detail = errorBody.detail || errorBody.message || detail;
    } catch {
      // Response body wasn't JSON — use status text
      detail = response.statusText || detail;
    }

    // On 401, clear invalid auth state
    if (response.status === 401) {
      detail = 'Invalid email or password.';
      clearStoredToken();
    } else if (response.status === 403) {
      detail = 'Your session is not authorized.';
    } else if (response.status >= 500) {
      if (detail.toLowerCase().includes('database') || detail.toLowerCase().includes('connection')) {
        detail = 'The server database is temporarily unavailable.';
      } else {
        detail = 'The server encountered an error. Please try again.';
      }
    }

    throw new ApiError(response.status, detail);
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// ─── Public API ─────────────────────────────────────────────────────────────

export const api = {
  get<T>(path: string, options?: { skipAuth?: boolean }): Promise<T> {
    return request<T>('GET', path, undefined, options);
  },

  post<T>(path: string, body?: unknown, options?: { skipAuth?: boolean }): Promise<T> {
    return request<T>('POST', path, body, options);
  },

  put<T>(path: string, body?: unknown, options?: { skipAuth?: boolean }): Promise<T> {
    return request<T>('PUT', path, body, options);
  },

  delete<T>(path: string, options?: { skipAuth?: boolean }): Promise<T> {
    return request<T>('DELETE', path, undefined, options);
  },

  patch<T>(path: string, body?: unknown, options?: { skipAuth?: boolean }): Promise<T> {
    return request<T>('PATCH', path, body, options);
  },
};

export default api;
