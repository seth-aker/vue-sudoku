import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { Eraser, ListChecks, ListX, Pencil, Redo2, RotateCcw, Undo2, Wand2 } from 'lucide-react-native'
import { useGameStore, selectCanRedo, selectCanUndo } from '@/stores'
import { useTheme } from '@/theme'

/**
 * Top row of game controls: pencil toggle, auto-candidate toggle, undo, redo,
 * erase, reset, fill-all-candidates, clear-all-candidates.
 *
 * Each button is icon-only; the row wraps on narrow screens. Reset uses
 * Alert.alert for confirmation (web app used window.confirm).
 */
export function SudokuControls() {
  const { theme } = useTheme()
  const usingPencil = useGameStore((s) => s.usingPencil)
  const autoCandidateMode = useGameStore((s) => s.autoCandidateMode)
  const canUndo = useGameStore(selectCanUndo)
  const canRedo = useGameStore(selectCanRedo)
  const selectedIdx = useGameStore((s) => s.selectedIdx)

  const togglePencil = useGameStore((s) => s.togglePencil)
  const toggleAutoCandidate = useGameStore((s) => s.toggleAutoCandidate)
  const undo = useGameStore((s) => s.undo)
  const redo = useGameStore((s) => s.redo)
  const eraseCell = useGameStore((s) => s.eraseCell)
  const resetPuzzle = useGameStore((s) => s.resetPuzzle)
  const fillCandidates = useGameStore((s) => s.fillCandidates)
  const clearAllCandidates = useGameStore((s) => s.clearAllCandidates)

  const onReset = () => {
    Alert.alert(
      'Reset puzzle?',
      'This clears all your progress on this puzzle.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => resetPuzzle() },
      ],
    )
  }

  const onErase = () => {
    if (selectedIdx === null) return
    eraseCell(selectedIdx)
  }

  return (
    <View style={styles.row}>
      <ToggleButton
        active={usingPencil}
        icon={<Pencil size={20} color={theme.colors.foreground} />}
        label="Pencil"
        onPress={togglePencil}
      />
      <ToggleButton
        active={autoCandidateMode}
        icon={<Wand2 size={20} color={theme.colors.foreground} />}
        label="Auto"
        onPress={toggleAutoCandidate}
      />
      <ActionButton
        icon={<Undo2 size={20} color={theme.colors.foreground} />}
        label="Undo"
        onPress={undo}
        disabled={!canUndo}
      />
      <ActionButton
        icon={<Redo2 size={20} color={theme.colors.foreground} />}
        label="Redo"
        onPress={redo}
        disabled={!canRedo}
      />
      <ActionButton
        icon={<Eraser size={20} color={theme.colors.foreground} />}
        label="Erase"
        onPress={onErase}
        disabled={selectedIdx === null}
      />
      <ActionButton
        icon={<ListChecks size={20} color={theme.colors.foreground} />}
        label="Fill"
        onPress={fillCandidates}
      />
      <ActionButton
        icon={<ListX size={20} color={theme.colors.foreground} />}
        label="Clear"
        onPress={clearAllCandidates}
      />
      <ActionButton
        icon={<RotateCcw size={20} color={theme.colors.destructive} />}
        label="Reset"
        onPress={onReset}
      />
    </View>
  )
}

function ToggleButton({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean
  icon: React.ReactNode
  label: string
  onPress: () => void
}) {
  const { theme } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: active ? theme.colors.primary : pressed ? theme.colors.muted : theme.colors.card,
          borderColor: active ? theme.colors.primary : theme.colors.border,
          borderRadius: theme.radius.md,
        },
      ]}
    >
      {icon}
      <Text
        style={{
          color: active ? theme.colors.primaryForeground : theme.colors.foreground,
          fontSize: theme.text.xs,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}

function ActionButton({
  icon,
  label,
  onPress,
  disabled = false,
}: {
  icon: React.ReactNode
  label: string
  onPress: () => void
  disabled?: boolean
}) {
  const { theme } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed ? theme.colors.muted : theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      {icon}
      <Text style={{ color: theme.colors.foreground, fontSize: theme.text.xs, marginTop: 2 }}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  button: {
    width: 64,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
})
