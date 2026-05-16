import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import 'react-native-reanimated';

import { useAppStateSync } from '@/src/hooks/useAppStateSync';
import { useUserStore } from '@/src/store/userStore';
import { ThemeProvider, useTheme } from '@/src/theme/ThemeProvider';

function ThemedStack() {
  const { theme, scheme } = useTheme();

  // Background/foreground timer + save bridge (plan §2.6 / §7.9).
  useAppStateSync();

  // Auth bootstrap (plan §7.7): resolve identity from a stored token, if any,
  // as an explicit effect rather than an import-time side effect.
  useEffect(() => {
    void useUserStore.getState().getSelf();
  }, []);
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surfaceAlt },
          headerTintColor: theme.colors.accent,
          headerTitleStyle: { color: theme.colors.text },
          contentStyle: { backgroundColor: theme.colors.background },
        }}>
        <Stack.Screen name="index" options={{ title: 'Sudoku' }} />
        <Stack.Screen name="about" options={{ title: 'About' }} />
        <Stack.Screen name="sudoku/[difficulty]" options={{ title: 'Sudoku' }} />
      </Stack>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedStack />
        </ThemeProvider>
      </SafeAreaProvider>
      <Toast />
    </GestureHandlerRootView>
  );
}
