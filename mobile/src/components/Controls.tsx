import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { useGameStore } from '@/src/store/gameStore';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Button, Checkbox, Toggle } from '@/src/ui';

export function Controls() {
  const { theme } = useTheme();
  const undo = useGameStore((s) => s.undo);
  const redo = useGameStore((s) => s.redo);
  const usingPencil = useGameStore((s) => s.usingPencil);
  const togglePencil = useGameStore((s) => s.togglePencil);
  const eraseSelected = useGameStore((s) => s.eraseSelected);
  const autoCandidateMode = useGameStore((s) => s.autoCandidateMode);
  const toggleAutoCandidate = useGameStore((s) => s.toggleAutoCandidate);
  const paused = useGameStore((s) => s.gameState === 'paused');

  const iconColor = theme.colors.text;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Button
          variant="secondary"
          size="icon"
          disabled={paused}
          onPress={undo}
          accessibilityLabel="Undo">
          <Ionicons name="arrow-undo" size={20} color={iconColor} />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          disabled={paused}
          onPress={redo}
          accessibilityLabel="Redo">
          <Ionicons name="arrow-redo" size={20} color={iconColor} />
        </Button>
        <Toggle
          pressed={usingPencil}
          disabled={paused}
          onPress={togglePencil}
          accessibilityLabel="Toggle pencil mode">
          <Ionicons
            name="pencil"
            size={20}
            color={usingPencil ? theme.colors.onAccent : iconColor}
          />
        </Toggle>
        <Button
          variant="secondary"
          size="icon"
          disabled={paused}
          onPress={eraseSelected}
          accessibilityLabel="Erase cell">
          <Ionicons name="backspace-outline" size={20} color={iconColor} />
        </Button>
      </View>
      <Checkbox
        checked={autoCandidateMode}
        disabled={paused}
        onChange={toggleAutoCandidate}
        label="Auto-fill candidates"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 12 },
  row: { flexDirection: 'row', gap: 8 },
});
