// services/api.ts
// API Service with LibreChat Authentication Integration

import { getToken, setToken, removeToken, setCurrentUser, refreshToken as refreshAuthToken, type AuthUser } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const LIBRECHAT_URL = import.meta.env.VITE_LIBRECHAT_URL || 'http://localhost:3080';

export interface AppFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface App {
  id: string;
  developer_id: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  imageUrl?: string;
  pluginUrl: string;
  tags: string[];
  status: string;
  rating: number;
  downloads: number;
  createdAt: number;
}

export interface CreateAppRequest {
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  imageUrl?: string;
  pluginUrl: string;
  tags: string[];
}

// Request helper with automatic token refresh
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 - try token refresh
  if (response.status === 401 && token) {
    const refreshResult = await refreshAuthToken();
    if (refreshResult?.token) {
      headers['Authorization'] = `Bearer ${refreshResult.token}`;
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } else {
      // Token refresh failed, clear auth state
      removeToken();
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.statusText}`);
  }

  return response.json();
}

// App Store API Functions
export async function fetchApps(filters?: AppFilters): Promise<App[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const query = params.toString();
  return request<App[]>(`/apps${query ? `?${query}` : ''}`);
}

export async function fetchApp(id: string): Promise<App> {
  return request<App>(`/apps/${id}`);
}

export async function installApp(id: string): Promise<{ status: string; app_id: string }> {
  return request(`/apps/${id}/install`, { method: 'POST' });
}

export async function submitApp(appData: CreateAppRequest): Promise<App> {
  return request<App>('/apps', {
    method: 'POST',
    body: JSON.stringify(appData),
  });
}

// LibreChat Authentication Functions
export async function login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const response = await fetch(`${LIBRECHAT_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();

  if (data.token) {
    setToken(data.token);
  }
  if (data.user) {
    setCurrentUser(data.user);
  }

  return data;
}

export async function register(
  email: string,
  username: string,
  password: string,
  name?: string
): Promise<{ token: string; user: AuthUser }> {
  const response = await fetch(`${LIBRECHAT_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      username,
      password,
      name: name || username,
      confirm_password: password
    }),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error(error.message || 'Registration failed');
  }

  const data = await response.json();

  if (data.token) {
    setToken(data.token);
  }
  if (data.user) {
    setCurrentUser(data.user);
  }

  return data;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${LIBRECHAT_URL}/api/user`, {
      headers: { 'Authorization': `Bearer ${token}` },
      credentials: 'include',
    });

    if (!response.ok) {
      // Try refresh
      const refreshResult = await refreshAuthToken();
      if (refreshResult?.user) {
        return refreshResult.user;
      }
      return null;
    }

    const user = await response.json();
    setCurrentUser(user);
    return user;
  } catch {
    return null;
  }
}

// User Submissions
export interface UserSubmission {
  submission_id: string;
  submission_status: 'pending' | 'approved' | 'rejected';
  validation_result: any;
  submitted_at: number;
  app_id: string;
  name: string;
  description: string;
  category: string;
  app_status: string;
  downloads: number;
  rating: number;
}

export async function getUserSubmissions(): Promise<UserSubmission[]> {
  const token = getToken();
  if (!token) return [];

  try {
    const response = await fetch(`${API_BASE_URL}/user/submissions`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      console.error('Failed to fetch user submissions');
      return [];
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    return [];
  }
}

// Zeq API Functions
export async function processQuery(query: string, domainHints?: string[]): Promise<any> {
  return request('/zeq/process', {
    method: 'POST',
    body: JSON.stringify({ query, domain_hints: domainHints }),
  });
}

export async function listOperators(): Promise<any> {
  return request('/zeq/operators');
}

// Admin Functions
export async function listSubmissions(): Promise<any[]> {
  return request('/submissions');
}

export async function approveSubmission(id: string): Promise<any> {
  return request(`/submissions/${id}/approve`, { method: 'POST' });
}

export async function rejectSubmission(id: string): Promise<any> {
  return request(`/submissions/${id}/reject`, { method: 'POST' });
}

// SDK API functions
export async function getSDKMetadata(): Promise<any> {
  return request('/zeq/sdk/metadata');
}

export async function getSDKCode(section?: string): Promise<any> {
  const query = section ? `?section=${section}` : '';
  return request(`/zeq/sdk/code${query}`);
}

export async function getSDKConfig(): Promise<any> {
  return request('/zeq/sdk/config');
}

export async function getDaemonCode(): Promise<any> {
  return request('/zeq/sdk/daemon-code');
}
