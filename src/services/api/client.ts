import { env } from '@/app/config/env';

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`);

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

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
