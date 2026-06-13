import { env } from '@/app/config/env';

// Hostname the app is actually using to reach the backend (e.g. "10.72.62.223").
const devHost = env.apiBaseUrl.match(/^https?:\/\/([^:/]+)/)?.[1] ?? null;

/**
 * Backend image URLs from a LOCAL Supabase point at 127.0.0.1 / localhost, which
 * on a phone resolves to the phone itself — so the image silently fails to load.
 * Rewrite those to the same LAN host the app uses for the API. Remote URLs
 * (Cloudinary, prod Supabase) don't match localhost, so this is a no-op for them.
 */
export function resolveImageUrl(url?: string | null): string | null {
  if (!url) return null;
  if (!devHost || devHost === 'localhost' || devHost === '127.0.0.1') return url;
  return url.replace(
    /^(https?:\/\/)(localhost|127\.0\.0\.1)(:\d+)?/i,
    (_m, proto: string, _host: string, port = '') => `${proto}${devHost}${port}`,
  );
}
