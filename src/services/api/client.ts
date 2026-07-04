import { env } from '@/app/config/env';
import { getAccessToken, getRefreshToken, setTokens, clearAuth } from '../storage/tokenStorage';

// Called when the session can no longer be recovered (refresh failed / expired).
// AuthContext registers a handler here so it can clear in-memory state and
// bounce the user to the login screen. Without this, clearAuth() only wipes
// SecureStore and the app stays stuck on "session expired" with no way back in.
let onAuthExpired: (() => void) | null = null;
export function setOnAuthExpired(handler: (() => void) | null) {
  onAuthExpired = handler;
}

async function handleSessionExpired() {
  await clearAuth();
  onAuthExpired?.();
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Single-flight refresh: if several requests 401 at once (common when a screen
// mounts and fires multiple queries), they all await the SAME refresh promise
// instead of each POSTing to /auth/refresh and racing each other's setTokens().
let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return false;
      try {
        const res = await fetch(`${env.apiBaseUrl}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        await setTokens(data.access_token, data.refresh_token);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

/**
 * Runs a request, and on 401 refreshes the session and retries ONCE.
 * `buildRequest` takes fresh headers each call, so the retry uses the NEW
 * access token (the previous implementation reused the stale expired token).
 */
async function request<T>(
  buildRequest: (headers: Record<string, string>) => Promise<Response>,
): Promise<T> {
  const response = await buildRequest(await getAuthHeaders());

  if (response.status !== 401) {
    return processValidResponse<T>(response);
  }

  const refreshed = await refreshSession();
  if (!refreshed) {
    await handleSessionExpired();
    throw new Error('Session expired. Please log in again.');
  }

  // Retry with freshly-fetched headers (new access token).
  const retried = await buildRequest(await getAuthHeaders());
  if (retried.status === 401) {
    await handleSessionExpired();
    throw new Error('Session expired. Please log in again.');
  }
  return processValidResponse<T>(retried);
}

async function processValidResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorDetail = `API request failed with status ${response.status}`;
    try {
      const errBody = await response.json();
      if (errBody.detail) {
        errorDetail = typeof errBody.detail === 'string' ? errBody.detail : JSON.stringify(errBody.detail);
      }
    } catch (e) {}
    throw new Error(errorDetail);
  }

  return response.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>((headers) => fetch(`${env.apiBaseUrl}${path}`, { headers }));
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  return request<T>((headers) =>
    fetch(`${env.apiBaseUrl}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }),
  );
}

export async function apiPut<T>(path: string, body: any): Promise<T> {
  return request<T>((headers) =>
    fetch(`${env.apiBaseUrl}${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    }),
  );
}

export async function apiPatch<T>(path: string, body: any): Promise<T> {
  return request<T>((headers) =>
    fetch(`${env.apiBaseUrl}${path}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    }),
  );
}

export async function apiDelete<T>(path: string): Promise<T> {
  return request<T>((headers) =>
    fetch(`${env.apiBaseUrl}${path}`, {
      method: 'DELETE',
      headers,
    }),
  );
}
