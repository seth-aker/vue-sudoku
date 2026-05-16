import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Dynamic Expo config. Static values live in app.json; this layer injects the
 * runtime-configurable API base URL into `expo.extra` so it is reachable via
 * `Constants.expoConfig.extra` (see src/config/env.ts).
 *
 * Resolution order for the API base URL:
 *   1. EXPO_PUBLIC_API_BASE_URL env var (set per-developer / per-build)
 *   2. Production default when building for production (NODE_ENV=production)
 *   3. Dev default — points at the dev machine over the LAN.
 *
 * For on-device development, set your machine's LAN IP, e.g.:
 *   EXPO_PUBLIC_API_BASE_URL="http://192.168.1.50:3666/api" pnpm start
 */
const PROD_API_BASE_URL = 'https://sudoku.aker-bergeron.dev/api';
const DEV_API_BASE_URL_DEFAULT = 'http://localhost:3666/api';

function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === 'production') return PROD_API_BASE_URL;
  return DEV_API_BASE_URL_DEFAULT;
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  extra: {
    ...config.extra,
    apiBaseUrl: resolveApiBaseUrl(),
  },
});
