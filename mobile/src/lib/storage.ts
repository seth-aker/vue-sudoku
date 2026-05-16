import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Thin async JSON wrapper around AsyncStorage. Replaces the web app's
 * synchronous localStorage usage for non-sensitive game state.
 */
export const storage = {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw == null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Persistence is best-effort; swallow write failures.
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

export const STORAGE_KEYS = {
  gameState: 'localGameState',
  elapsedSeconds: 'elapsedSeconds',
  colorSchemeOverride: 'colorSchemeOverride',
} as const;
