import { Platform } from 'react-native';
import Constants from 'expo-constants';

const API_PORT = 8000;

/**
 * Resolve the backend base URL.
 *
 * On a physical device / Android emulator, `localhost` points to the device
 * itself — not your dev machine — which causes "Network request failed".
 * In development we therefore reuse the LAN IP that Expo's Metro bundler is
 * already served from (e.g. "10.72.62.223:8081") and just swap in the API port.
 *
 * Override anytime by setting EXPO_PUBLIC_API_URL (e.g. a staging URL).
 */
function resolveApiBaseUrl(): string {
  const override = process.env.EXPO_PUBLIC_API_URL;
  if (override) return override.replace(/\/$/, '');

  // Web runs in the browser on the same machine, so localhost is correct.
  if (Platform.OS === 'web') return `http://localhost:${API_PORT}`;

  // expoConfig.hostUri is the "<lan-ip>:<port>" Metro is bound to.
  const hostUri =
    Constants.expoConfig?.hostUri ??
    // Fallbacks for older Expo runtimes.
    (Constants as any).manifest?.debuggerHost ??
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

  const host = hostUri?.split(':')[0];
  if (host) return `http://${host}:${API_PORT}`;

  // Last resort (e.g. standalone build with no override configured).
  return `http://localhost:${API_PORT}`;
}

export const env = {
  appName: 'Lubist Mobile',
  apiBaseUrl: resolveApiBaseUrl(),
};
