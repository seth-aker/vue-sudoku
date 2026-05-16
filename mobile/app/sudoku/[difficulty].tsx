import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { CompletionModal } from '@/src/components/CompletionModal';
import { Controls } from '@/src/components/Controls';
import { GameHeader } from '@/src/components/GameHeader';
import { LoadingOverlay } from '@/src/components/LoadingOverlay';
import { Numpad } from '@/src/components/Numpad';
import { PauseOverlay } from '@/src/components/PauseOverlay';
import { SudokuGrid } from '@/src/components/SudokuGrid';
import { isPlayableDifficulty } from '@/src/domain';
import { useGameStore } from '@/src/store/gameStore';
import { useUserStore } from '@/src/store/userStore';
import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemeToggle } from '@/src/ui';

export default function SudokuScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { difficulty } = useLocalSearchParams<{ difficulty: string }>();

  const loading = useGameStore((s) => s.loading);
  const newPuzzle = useGameStore((s) => s.newPuzzle);

  useEffect(() => {
    if (!isPlayableDifficulty(difficulty)) {
      Toast.show({
        type: 'error',
        text1: `'${difficulty}' is not a playable difficulty`,
      });
      router.replace('/');
      return;
    }

    const game = useGameStore.getState();

    const init = async () => {
      // Came from Resume: store already has this puzzle loaded.
      if (
        game.puzzleId &&
        game.difficulty?.rating === difficulty &&
        game.cells.some((c) => c.value !== 0)
      ) {
        game.startTimer();
        return;
      }
      const hydrated = await game.hydrateFromLocal();
      if (hydrated && useGameStore.getState().difficulty?.rating === difficulty) {
        useGameStore.getState().startTimer();
      } else {
        const res = await newPuzzle(difficulty);
        if (!res.success) {
          Toast.show({
            type: 'error',
            text1: 'Could not load puzzle',
            text2: res.message,
            visibilityTime: 6000,
          });
        }
      }
    };
    void init();

    return () => {
      const s = useGameStore.getState();
      s.pauseTimer();
      // Always flush local immediately; surface a toast for the server save.
      void s.persistNow();
      if (useUserStore.getState().isAuthenticated() && s.puzzleId) {
        void s.saveGameState().then((res) => {
          Toast.show({
            type: res.success ? 'success' : 'error',
            text1: res.success ? 'Game saved' : 'Could not save game',
          });
        });
      }
    };
    // Only re-init when the difficulty route param changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const onNewPuzzle = () => {
    if (isPlayableDifficulty(difficulty)) void newPuzzle(difficulty);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerRight: () => <ThemeToggle /> }} />
      <ScrollView contentContainerStyle={styles.content}>
        <GameHeader />
        <View style={styles.gridWrap}>
          <SudokuGrid />
        </View>
        <Numpad />
        <Controls />
      </ScrollView>

      <PauseOverlay />
      <CompletionModal onNewPuzzle={onNewPuzzle} />
      {loading ? <LoadingOverlay message="Loading puzzle…" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { alignItems: 'center', gap: 16, paddingBottom: 24 },
  gridWrap: { marginTop: 12 },
});
