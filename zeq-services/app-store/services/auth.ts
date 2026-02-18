// services/auth.ts
// Unified Authentication Service - Uses LibreChat as primary auth provider

const TOKEN_KEY = 'zeq_token';
const USER_KEY = 'zeq_user';
const LIBRECHAT_URL = import.meta.env.VITE_LIBRECHAT_URL || 'http://localhost:3080';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name?: string;
  role?: string;
  provider?: string;
  avatar?: string;
}

// Token Management
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

// User Management
export function getCurrentUser(): AuthUser | null {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      return null;
    }
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Error parsing user from localStorage:', e);
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setCurrentUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// LibreChat Authentication
export async function loginViaLibreChat(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
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

  // Store token and user
  if (data.token) {
    setToken(data.token);
  }
  if (data.user) {
    setCurrentUser(data.user);
  }

  return data;
}

// Register via LibreChat
export async function registerViaLibreChat(
  email: string,
  username: string,
  password: string,
  name?: string
): Promise<{ token: string; user: AuthUser }> {
  const response = await fetch(`${LIBRECHAT_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password, name: name || username }),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error(error.message || 'Registration failed');
  }

  const data = await response.json();

  // Store token and user
  if (data.token) {
    setToken(data.token);
  }
  if (data.user) {
    setCurrentUser(data.user);
  }

  return data;
}

// Validate token with LibreChat API
export async function validateToken(token?: string): Promise<AuthUser | null> {
  const authToken = token || getToken();
  if (!authToken) return null;

  try {
    const response = await fetch(`${LIBRECHAT_URL}/api/user`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const user = await response.json();
    setCurrentUser(user);
    return user;
  } catch {
    return null;
  }
}

// Refresh token via LibreChat
export async function refreshToken(): Promise<{ token: string; user: AuthUser } | null> {
  try {
    const response = await fetch(`${LIBRECHAT_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.token) {
      setToken(data.token);
    }
    if (data.user) {
      setCurrentUser(data.user);
    }
    return data;
  } catch {
    return null;
  }
}

// Logout
export async function logout(): Promise<void> {
  try {
    // Call LibreChat logout endpoint
    await fetch(`${LIBRECHAT_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
      credentials: 'include',
    });
  } catch {
    // Continue with local logout even if API call fails
  }

  removeToken();
}

// Redirect to LibreChat login page (for OAuth flows)
export function redirectToLibreChatLogin(returnUrl?: string): void {
  const currentUrl = returnUrl || window.location.href;
  window.location.href = `${LIBRECHAT_URL}/login?returnTo=${encodeURIComponent(currentUrl)}`;
}

// Get LibreChat URL for external use
export function getLibreChatUrl(): string {
  return LIBRECHAT_URL;
}
