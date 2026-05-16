import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AuthModal } from '@/src/components/AuthModal';
import type { DifficultyRating } from '@/src/domain';
import { useGameStore } from '@/src/store/gameStore';
import { useUserStore } from '@/src/store/userStore';
import { useTheme } from '@/src/theme/ThemeProvider';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ThemeToggle,
} from '@/src/ui';

export default function HomeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);

  const isAuthenticated = useUserStore((s) => s.isAuthenticated());
  const currentPuzzleId = useUserStore((s) => s.currentPuzzleId);
  const logout = useUserStore((s) => s.logout);
  const loadUserPuzzle = useGameStore((s) => s.loadUserPuzzle);
  const loading = useGameStore((s) => s.loading);

  const go = (d: DifficultyRating) => router.push(`/sudoku/${d}`);

  const resume = async () => {
    if (!currentPuzzleId) return;
    const res = await loadUserPuzzle(currentPuzzleId);
    if (res.success) {
      const rating = useGameStore.getState().difficulty?.rating ?? 'beginner';
      router.push(`/sudoku/${rating}`);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={styles.headerRight}>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                accessibilityLabel={isAuthenticated ? 'Log out' : 'Login'}
                onPress={() =>
                  isAuthenticated ? logout() : setAuthOpen(true)
                }>
                <Ionicons
                  name={isAuthenticated ? 'log-out-outline' : 'person-circle-outline'}
                  size={24}
                  color={theme.colors.text}
                />
              </Button>
            </View>
          ),
        }}
      />

      <Card style={styles.card}>
        <CardHeader>
          <CardTitle>Sudoku</CardTitle>
          <CardDescription>Pick a difficulty to get started</CardDescription>
        </CardHeader>
        <CardContent>
          {isAuthenticated && currentPuzzleId ? (
            <Button
              title="Resume Game"
              loading={loading}
              style={styles.btn}
              onPress={resume}
            />
          ) : null}
          <Button title="Beginner" style={styles.btn} onPress={() => go('beginner')} />
          <Button title="Easy" style={styles.btn} onPress={() => go('easy')} />
          <Button title="Medium" style={styles.btn} onPress={() => go('medium')} />
          <Button
            title="Hard (Coming Soon!)"
            variant="secondary"
            disabled
            style={styles.btn}
          />
          <Button
            title="Impossible (Coming Soon!)"
            variant="secondary"
            disabled
            style={styles.btn}
          />
          <Button
            title="About"
            variant="link"
            onPress={() => router.push('/about')}
          />
        </CardContent>
      </Card>

      <AuthModal visible={authOpen} onClose={() => setAuthOpen(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: { width: '100%', maxWidth: 400 },
  btn: { width: 220, marginVertical: 4 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
