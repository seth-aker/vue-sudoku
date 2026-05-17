import Constants from 'expo-constants'
import { Platform } from 'react-native'

/**
 * Resolve the backend's API base URL. Precedence:
 *
 *   1. `API_BASE_URL` env var at config-eval time (via app.config.ts → expo-constants).
 *      Use this when you want a hard pin (e.g. testing against staging).
 *   2. The host Metro is bound to (`Constants.expoGoConfig.debuggerHost`).
 *      In Expo Go, this is the laptop's IP that the device used to reach the
 *      dev server, which is exactly the host the backend should be on too.
 *      Works for: Android emulator (no more 10.0.2.2 footgun), iOS simulator,
 *      and physical phones on the same WiFi.
 *   3. Platform-specific defaults: `10.0.2.2` on Android (emulator's host alias),
 *      `localhost` everywhere else.
 *   4. The production HTTPS URL when running a production build.
 *
 * The backend's PORT defaults to 3666 (see backend/.env.example); override
 * with API_BASE_URL if you've changed it.
 */
const BACKEND_PORT = 3666
const PROD_URL = 'https://sudoku.aker-bergeron.dev/api'

function readApiBaseUrl(): string {
  // 1. Explicit override.
  const fromExtra = Constants.expoConfig?.extra?.apiBaseUrl
  if (typeof fromExtra === 'string' && fromExtra.startsWith('http')) {
    return fromExtra
  }

  // Production builds never auto-detect — go straight to the deployed URL.
  if (process.env.NODE_ENV === 'production') {
    return PROD_URL
  }

  // 2. Metro debugger host — covers ~all dev scenarios.
  //    Shape: "192.168.1.42:8081" or sometimes "192.168.1.42".
  //    `expoGoConfig` is only populated in Expo Go; outside of it this is undefined.
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ?? Constants.expoConfig?.hostUri ?? null
  if (typeof debuggerHost === 'string' && debuggerHost.length > 0) {
    const host = debuggerHost.split(':')[0]
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:${BACKEND_PORT}/api`
    }
  }

  // 3. Platform fallback. Android emulator can't reach the host via
  //    "localhost" — it has a special alias `10.0.2.2`.
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${BACKEND_PORT}/api`
  }
  return `http://localhost:${BACKEND_PORT}/api`
}

export const API_BASE_URL = readApiBaseUrl()

if (__DEV__) {
  // Print once at startup so it's easy to confirm the URL the app is using.
  // Shows up in the Metro logs.
  // eslint-disable-next-line no-console
  console.log(`[config] API_BASE_URL = ${API_BASE_URL}`)
}

/** Difficulty values the mobile app actually exposes as routes. Mirrors the web app. */
export const PUZZLE_DIFFICULTY_ROUTES = ['beginner', 'easy', 'medium'] as const
export type DifficultyRoute = (typeof PUZZLE_DIFFICULTY_ROUTES)[number]

export function isDifficultyRoute(value: unknown): value is DifficultyRoute {
  return typeof value === 'string' && (PUZZLE_DIFFICULTY_ROUTES as readonly string[]).includes(value)
}
