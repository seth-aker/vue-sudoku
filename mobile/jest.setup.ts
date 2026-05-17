/**
 * Jest test setup. Wires mocks for native modules that aren't available
 * outside a real RN runtime (AsyncStorage, SecureStore, expo-constants).
 */
import { jest } from '@jest/globals'

// AsyncStorage — official in-memory mock.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)

// expo-secure-store — simple in-memory shim.
jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>()
  return {
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value)
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key)
    }),
  }
})

// expo-constants — return a stable apiBaseUrl so api/client doesn't try to
// resolve from the (absent) Expo runtime.
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: { apiBaseUrl: 'http://localhost:3666/api' } } },
}))
