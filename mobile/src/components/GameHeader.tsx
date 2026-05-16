import { Ionicons } from '@expo/vector-icons';
import { Alert, StyleSheet, View } from 'react-native';

import { formatElapsed, useGameStore } from '@/src/store/gameStore';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Button, ThemedText, Toggle } from '@/src/ui';

export function GameHeader() {
  const { theme } = useTheme();
  const difficulty = useGameStore((s) => s.difficulty?.rating);
  const elapsed = useGameStore((s) => s.elapsedSeconds);
  const playing = useGameStore((s) => s.gameState === 'playing');
  const toggleTimer = useGameStore((s) => s.toggleTimer);
  const resetPuzzle = useGameStore((s) => s.resetPuzzle);

  const title = difficulty
    ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    : '';

  const onReset = () =>
    Alert.alert(
      'Reset puzzle?',
      'This action cannot be undone, are you sure you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetPuzzle },
      ],
    );

  const onHelp = () =>
    Alert.alert(
      'How to play',
      'Tap a cell to select it, then tap a number on the keypad to place it. ' +
        'Use the pencil toggle for candidate marks, the eraser to clear a cell, ' +
        'and undo/redo to step through your moves.',
    );

  return (
    <View
      style={[styles.bar, { backgroundColor: theme.colors.surfaceAlt }]}
      accessibilityLabel="Game header">
      <ThemedText variant="subtitle">{title}</ThemedText>
      <ThemedText variant="body">{formatElapsed(elapsed)}</ThemedText>
      <View style={styles.actions}>
        <Toggle
          pressed={!playing}
          onPress={toggleTimer}
          accessibilityLabel={playing ? 'Pause timer' : 'Resume timer'}>
          <Ionicons
            name={playing ? 'pause' : 'play'}
            size={18}
            color={!playing ? theme.colors.onAccent : theme.colors.text}
          />
        </Toggle>
        <Button
          variant="ghost"
          size="icon"
          onPress={onHelp}
          accessibilityLabel="Help">
          <Ionicons
            name="help-circle-outline"
            size={22}
            color={theme.colors.text}
          />
        </Button>
        <Button variant="ghost" size="sm" title="Reset" onPress={onReset} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
