import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useGameStore } from '@/stores'
import { BOARD_SIZE } from '@/types'
import { useTheme } from '@/theme'

/**
 * 3x3 numpad. Matches the Vue web's Numpad.vue:
 *  - Filled-dark buttons (shadcn default = primary variant), digit centered.
 *  - Buttons are disabled when the value already appears 9 times on the board
 *    (i.e. it's "used up"). Web parity.
 *  - Tapping the same value that's currently in the selected cell clears it
 *    (handled by the game store's setCell — toggle semantics).
 *  - In pencil mode, taps toggle the candidate rather than the value.
 */
const BUTTON_SIZE = 48     // size-12 = 48px in Tailwind
const BUTTON_GAP = 4

export function Numpad() {
  const usingPencil = useGameStore((s) => s.usingPencil)
  const selectedIdx = useGameStore((s) => s.selectedIdx)
  const setCell = useGameStore((s) => s.setCell)
  const toggleCandidate = useGameStore((s) => s.toggleCandidate)
  const cells = useGameStore((s) => s.cells)
  const status = useGameStore((s) => s.status)

  // Count how many times each value appears on the board. Used to disable
  // a number once it's been placed 9 times (matches Numpad.vue).
  const counts = (() => {
    const c = new Array(BOARD_SIZE + 1).fill(0)
    for (const cell of cells) if (cell.value !== 0) c[cell.value]++
    return c
  })()

  const onPress = (n: number) => {
    if (selectedIdx === null) return
    if (usingPencil) toggleCandidate(selectedIdx, n)
    else setCell(selectedIdx, n)
  }

  const isPaused = status === 'paused'

  return (
    <View style={styles.wrap}>
      <View style={styles.grid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <NumpadButton
            key={n}
            value={n}
            onPress={() => onPress(n)}
            disabled={selectedIdx === null || isPaused || counts[n] >= BOARD_SIZE}
          />
        ))}
      </View>
    </View>
  )
}

function NumpadButton({
  value,
  onPress,
  disabled,
}: {
  value: number
  onPress: () => void
  disabled: boolean
}) {
  const { theme } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`Place ${value}`}
      style={({ pressed }) => [
        styles.button,
        {
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          backgroundColor: pressed && !disabled ? theme.colors.foreground : theme.colors.primary,
          borderRadius: theme.radius.md,
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      <Text
        style={{
          color: theme.colors.primaryForeground,
          fontSize: theme.text.xl,
          fontWeight: '600',
        }}
      >
        {value}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: BUTTON_SIZE * 3 + BUTTON_GAP * 2,
    gap: BUTTON_GAP,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
