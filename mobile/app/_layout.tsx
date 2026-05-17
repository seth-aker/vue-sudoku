import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ThemeProvider, useTheme } from '@/theme'
import { Toast } from '@/components/Toast'
import { useUserStore } from '@/stores'

/**
 * Inner stack with theme-aware screen options. Pulled out so it can call
 * useTheme() inside the provider.
 */
function ThemedStack() {
  const { theme } = useTheme()
  return (
    <>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.foreground,
          headerTitleStyle: { color: theme.colors.foreground },
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Sudoku Chive' }} />
        <Stack.Screen name="about" options={{ title: 'About' }} />
        <Stack.Screen name="sudoku/[difficulty]" options={{ title: 'Sudoku' }} />
      </Stack>
    </>
  )
}

/**
 * On launch, try to resume the session. If a token is in SecureStore and
 * still valid, we get back the user and the rest of the app sees them as
 * authenticated. On any failure (no token, expired, network), the store
 * stays anonymous — this is a silent no-op for first-run users.
 */
function SessionBootstrap() {
  const getSelf = useUserStore((s) => s.getSelf)
  useEffect(() => {
    void getSelf()
  }, [getSelf])
  return null
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <SessionBootstrap />
          <ThemedStack />
          <Toast />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
