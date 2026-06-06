import { env } from '@/app/config/env';
import { getAccessToken, getRefreshToken, setTokens, clearAuth } from '../storage/tokenStorage';

async function getAuthHeaders() {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response, originalRequest: () => Promise<Response>): Promise<T> {
  if (response.status === 401) {
    // Attempt token refresh
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${env.apiBaseUrl}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          await setTokens(data.access_token, data.refresh_token);
          // Retry original request
          const retriedResponse = await originalRequest();
          return processValidResponse(retriedResponse);
        } else {
          await clearAuth();
          throw new Error('Session expired. Please log in again.');
        }
      } catch (err) {
        await clearAuth();
        throw new Error('Session expired. Please log in again.');
      }
    } else {
      await clearAuth();
      throw new Error('Session expired. Please log in again.');
    }
  }

  return processValidResponse(response);
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
  const headers = await getAuthHeaders();
  
  const makeRequest = () => fetch(`${env.apiBaseUrl}${path}`, { headers });
  const response = await makeRequest();

  return handleResponse<T>(response, makeRequest);
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  const headers = await getAuthHeaders();
  
  const makeRequest = () => fetch(`${env.apiBaseUrl}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const response = await makeRequest();

  return handleResponse<T>(response, makeRequest);
}

export async function apiPut<T>(path: string, body: any): Promise<T> {
  const headers = await getAuthHeaders();
  
  const makeRequest = () => fetch(`${env.apiBaseUrl}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  const response = await makeRequest();

  return handleResponse<T>(response, makeRequest);
}

export async function apiPatch<T>(path: string, body: any): Promise<T> {
  const headers = await getAuthHeaders();
  
  const makeRequest = () => fetch(`${env.apiBaseUrl}${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });
  const response = await makeRequest();

  return handleResponse<T>(response, makeRequest);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders();
  
  const makeRequest = () => fetch(`${env.apiBaseUrl}${path}`, {
    method: 'DELETE',
    headers,
  });
  const response = await makeRequest();

  return handleResponse<T>(response, makeRequest);
}
