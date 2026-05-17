import { Pressable, StyleSheet, Text, View } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useGameStore, selectCanRedo, selectCanUndo } from '@/stores'
import { useTheme } from '@/theme'
import { Checkbox } from '@/components/ui'
import { Numpad } from './Numpad'

/**
 * Matches the Vue web's SudokuControls.vue layout exactly:
 *
 *   ┌─────────────────────────────────────┐
 *   │  [ ↶ ]  [ ↷ ]  [ ✎ ]                │  ← undo / redo / pencil-toggle
 *   │                                      │
 *   │       [1] [2] [3]                    │
 *   │       [4] [5] [6]                    │  ← Numpad
 *   │       [7] [8] [9]                    │
 *   │                                      │
 *   │      [□] Auto-fill candidates        │  ← Checkbox + label
 *   └─────────────────────────────────────┘
 *
 * No standalone Erase / Fill / Clear / Reset buttons — Reset moves to the
 * screen header to mirror the web.
 */
const BUTTON_SIZE = 48

export function SudokuControls() {
  const { theme } = useTheme()
  const usingPencil = useGameStore((s) => s.usingPencil)
  const autoCandidateMode = useGameStore((s) => s.autoCandidateMode)
  const canUndo = useGameStore(selectCanUndo)
  const canRedo = useGameStore(selectCanRedo)
  const status = useGameStore((s) => s.status)

  const togglePencil = useGameStore((s) => s.togglePencil)
  const toggleAutoCandidate = useGameStore((s) => s.toggleAutoCandidate)
  const undo = useGameStore((s) => s.undo)
  const redo = useGameStore((s) => s.redo)

  const isPaused = status === 'paused'

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <IconButton
          icon="undo"
          accessibilityLabel="Undo"
          onPress={undo}
          disabled={!canUndo || isPaused}
        />
        <IconButton
          icon="redo"
          accessibilityLabel="Redo"
          onPress={redo}
          disabled={!canRedo || isPaused}
        />
        <IconButton
          icon="edit"
          accessibilityLabel="Pencil mode"
          onPress={togglePencil}
          disabled={isPaused}
          active={usingPencil}
        />
      </View>

      <View style={styles.numpadWrap}>
        <Numpad />
      </View>

      <View style={styles.checkboxRow}>
        <Checkbox
          checked={autoCandidateMode}
          onCheckedChange={() => toggleAutoCandidate()}
          disabled={isPaused}
          accessibilityLabel="Auto-fill candidates"
        />
        <Text
          style={{
            color: theme.colors.foreground,
            fontSize: theme.text.xs,
            marginLeft: theme.spacing[1],
          }}
        >
          Auto-fill candidates
        </Text>
      </View>
    </View>
  )
}

interface IconButtonProps {
  icon: keyof typeof MaterialIcons.glyphMap
  accessibilityLabel: string
  onPress: () => void
  disabled?: boolean
  /** When true, renders in the brand (orange-400) variant. Used for the pencil toggle. */
  active?: boolean
}

function IconButton({ icon, accessibilityLabel, onPress, disabled, active }: IconButtonProps) {
  const { theme } = useTheme()
  const bg = active ? theme.colors.brand : theme.colors.primary
  const fg = active ? '#000000' : theme.colors.primaryForeground
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, selected: active }}
      style={({ pressed }) => [
        styles.iconBtn,
        {
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          backgroundColor: bg,
          borderRadius: theme.radius.md,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <MaterialIcons name={icon} size={22} color={fg} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: BUTTON_SIZE * 3 + 16,  // matches the Numpad width below
    alignItems: 'center',
  },
  numpadWrap: {
    marginTop: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  iconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
