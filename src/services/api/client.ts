import { env } from '@/app/config/env';

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`);

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
