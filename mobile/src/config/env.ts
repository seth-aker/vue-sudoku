import Constants from 'expo-constants';

/**
 * Runtime environment access. The API base URL is injected by app.config.ts
 * into expo.extra at build/start time. See app.config.ts for how to override
 * it (EXPO_PUBLIC_API_BASE_URL) when running on a physical device.
 */
const extra = (Constants.expoConfig?.extra ?? {}) as {
  apiBaseUrl?: string;
};

const FALLBACK_API_BASE_URL = 'http://localhost:3666/api';

export const env = {
  /** Base URL for the backend API, e.g. http://192.168.1.50:3666/api */
  API_BASE_URL: extra.apiBaseUrl ?? FALLBACK_API_BASE_URL,
};
