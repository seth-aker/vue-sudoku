import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useGameStore, selectNumberWorks } from '@/stores'
import { useTheme } from '@/theme'

/**
 * 3x3 numpad for entering values or toggling candidates. Routes through
 * useGameStore — when `usingPencil` is on, taps call toggleCandidate;
 * otherwise they call setCell.
 *
 * Buttons are visually de-emphasized (not disabled) when the value would
 * conflict with a peer of the selected cell — gives a hint without blocking
 * the user from entering it (some users like to confirm conflicts visually).
 */
export function Numpad() {
  const usingPencil = useGameStore((s) => s.usingPencil)
  const selectedIdx = useGameStore((s) => s.selectedIdx)
  const setCell = useGameStore((s) => s.setCell)
  const toggleCandidate = useGameStore((s) => s.toggleCandidate)

  const onPressNumber = (n: number) => {
    if (selectedIdx === null) return
    if (usingPencil) {
      toggleCandidate(selectedIdx, n)
    } else {
      setCell(selectedIdx, n)
    }
  }

  return (
    <View style={styles.grid}>
      {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
        <NumpadButton
          key={n}
          value={n}
          onPress={() => onPressNumber(n)}
          disabled={selectedIdx === null}
        />
      ))}
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
  const wouldConflict = useGameStore((s) =>
    s.selectedIdx === null ? false : !selectNumberWorks(s, value),
  )

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: pressed ? theme.colors.muted : theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          opacity: disabled ? 0.4 : wouldConflict ? 0.5 : 1,
        },
      ]}
    >
      <Text
        style={{
          color: theme.colors.foreground,
          fontSize: theme.text['2xl'],
          fontWeight: '600',
        }}
      >
        {value}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  button: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
})
