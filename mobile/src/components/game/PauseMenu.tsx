import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme'
import { formatElapsed, useGameStore } from '@/stores'
import { Button } from '@/components/ui'

interface PauseMenuProps {
  visible: boolean
  onResume: () => void
  /** Optional callback to navigate back to home. */
  onExit?: () => void
}

/**
 * Pause modal. Shows current elapsed time and a "Resume" button. The game
 * screen owns the `visible` flag (it's derived from `status === 'paused'`)
 * so this component is purely presentational.
 */
export function PauseMenu({ visible, onResume, onExit }: PauseMenuProps) {
  const { theme } = useTheme()
  const elapsed = useGameStore((s) => s.elapsedSeconds)
  const difficulty = useGameStore((s) => s.difficulty)

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onResume}>
      <Pressable style={styles.backdrop} onPress={onResume}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.xl,
              padding: theme.spacing[6],
              gap: theme.spacing[3],
            },
          ]}
          // Stop propagation so taps inside the card don't trigger backdrop dismiss.
          onStartShouldSetResponder={() => true}
        >
          <Text style={{ color: theme.colors.foreground, fontSize: theme.text['2xl'], fontWeight: '700' }}>
            Paused
          </Text>
          <Text style={{ color: theme.colors.mutedForeground, fontSize: theme.text.base }}>
            {difficulty ? `${difficulty.rating} · ` : ''}
            {formatElapsed(elapsed)}
          </Text>
          <View style={{ height: theme.spacing[2] }} />
          <Button label="Resume" onPress={onResume} fullWidth />
          {onExit ? (
            <Button label="Exit to home" variant="ghost" onPress={onExit} fullWidth />
          ) : null}
        </View>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
  },
})
