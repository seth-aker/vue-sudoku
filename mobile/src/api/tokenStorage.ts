import * as SecureStore from 'expo-secure-store'

/**
 * Wrapper around expo-secure-store for the mobile JWT bearer token.
 * Stored under Keychain (iOS) / Keystore (Android) — not AsyncStorage, since
 * it's a long-lived credential.
 *
 * On web (Expo Web dev mode), SecureStore is not available; the operations
 * silently no-op (token won't persist, which is fine for dev). Mobile builds
 * always go through SecureStore.
 */

const TOKEN_KEY = 'sudoku-chive.jwt'

const secureStoreAvailable = (() => {
  // SecureStore throws if used on platforms where it's not available.
  // Detect once and gate.
  try {
    return typeof SecureStore.getItemAsync === 'function'
  } catch {
    return false
  }
})()

export async function getToken(): Promise<string | null> {
  if (!secureStoreAvailable) return null
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY)
  } catch {
    return null
  }
}

export async function setToken(token: string): Promise<void> {
  if (!secureStoreAvailable) return
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token)
  } catch {
    // Best-effort. If storage fails, the in-memory session still works for
    // the current run; the user will just have to log in again on next launch.
  }
}

export async function clearToken(): Promise<void> {
  if (!secureStoreAvailable) return
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
  } catch {
    // Ignore — nothing to do.
  }
}
