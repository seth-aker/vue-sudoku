import Constants from 'expo-constants'

/**
 * The backend's API base URL, resolved at config-eval time by `app.config.ts`
 * and surfaced through `expo-constants`. See `mobile/README.md` for how to
 * override it (LAN IP for physical devices, adb reverse for Android USB).
 */
function readApiBaseUrl(): string {
  const fromExtra = Constants.expoConfig?.extra?.apiBaseUrl
  if (typeof fromExtra === 'string' && fromExtra.length > 0) {
    return fromExtra
  }
  // Hard fallback so the app never crashes at boot if expo config is missing
  // a value for some reason. Matches the dev default in app.config.ts.
  return 'http://localhost:3666/api'
}

export const API_BASE_URL = readApiBaseUrl()

/** Difficulty values the mobile app actually exposes as routes. Mirrors the web app. */
export const PUZZLE_DIFFICULTY_ROUTES = ['beginner', 'easy', 'medium'] as const
export type DifficultyRoute = (typeof PUZZLE_DIFFICULTY_ROUTES)[number]

export function isDifficultyRoute(value: unknown): value is DifficultyRoute {
  return typeof value === 'string' && (PUZZLE_DIFFICULTY_ROUTES as readonly string[]).includes(value)
}
