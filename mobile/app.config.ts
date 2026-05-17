import type { ExpoConfig, ConfigContext } from 'expo/config'

/**
 * Layered on top of app.json. Resolves the API base URL at config-eval time so
 * runtime code can read it via expo-constants.
 *
 * Override at build/dev time with:
 *   API_BASE_URL=http://192.168.x.x:3666/api pnpm --filter mobile start
 *
 * When testing against a backend on the dev laptop from a physical phone,
 * you'll usually want the laptop's LAN IP here, not "localhost".
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const envUrl = process.env.API_BASE_URL
  const isProd = process.env.NODE_ENV === 'production'
  const defaultUrl = isProd
    ? 'https://sudoku.aker-bergeron.dev/api'
    : 'http://localhost:3666/api'

  return {
    ...config,
    name: config.name ?? 'Sudoku Chive',
    slug: config.slug ?? 'sudoku-chive',
    extra: {
      ...config.extra,
      apiBaseUrl: envUrl ?? defaultUrl,
    },
  }
}
