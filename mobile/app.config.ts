import type { ExpoConfig, ConfigContext } from 'expo/config'

/**
 * Layered on top of app.json.
 *
 * Only forwards `API_BASE_URL` into `extra.apiBaseUrl` when explicitly set.
 * When unset, the runtime in `src/config/index.ts` auto-detects from Metro's
 * debugger host (works for Android emulator, iOS simulator, and physical
 * devices), falling back to platform-specific defaults.
 *
 * Override at boot when you need a hard pin:
 *   API_BASE_URL=http://192.168.1.42:3666/api pnpm --filter mobile start
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const envUrl = process.env.API_BASE_URL

  return {
    ...config,
    name: config.name ?? 'Sudoku Chive',
    slug: config.slug ?? 'sudoku-chive',
    extra: {
      ...config.extra,
      // Only forward when set; otherwise let runtime auto-detect.
      apiBaseUrl: envUrl ?? null,
    },
  }
}
