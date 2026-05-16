import * as SecureStore from 'expo-secure-store';

/**
 * Secure storage for the JWT auth token. Uses the OS keychain/keystore via
 * expo-secure-store (never AsyncStorage for credentials).
 */
const TOKEN_KEY = 'auth_jwt';

export const tokenStore = {
  async get(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async set(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async clear(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {
      // ignore
    }
  },
};
