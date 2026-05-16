import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Runtime API base URL.
 *
 * Resolution:
 *  1. EXPO_PUBLIC_API_BASE_URL (injected into expo.extra by app.config.ts) —
 *     required for physical devices (set it to your dev machine's LAN IP).
 *  2. Production default (when built with NODE_ENV=production).
 *  3. Dev fallback, chosen per-platform because emulators cannot use
 *     "localhost" to reach the host machine:
 *       - Android emulator: 10.0.2.2 is the host loopback alias.
 *       - iOS simulator / web: localhost works.
 */
const extra = (Constants.expoConfig?.extra ?? {}) as {
  apiBaseUrl?: string;
};

const devFallback =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3666/api'
    : 'http://localhost:3666/api';

export const env = {
  /** Base URL for the backend API, e.g. http://192.168.1.50:3666/api */
  API_BASE_URL: extra.apiBaseUrl ?? devFallback,
};
