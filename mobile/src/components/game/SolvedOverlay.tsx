import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { PartyPopper } from 'lucide-react-native'
import { useTheme } from '@/theme'
import { Button } from '@/components/ui'
import { formatElapsed, useGameStore } from '@/stores'

interface SolvedOverlayProps {
  visible: boolean
  onClose: () => void
  onPlayAnother?: () => void
  onExit?: () => void
}

/**
 * Shown when the user successfully completes the puzzle. The game screen owns
 * `visible` (typically `status === 'solved' && shouldShowSolvedDialog`).
 */
export function SolvedOverlay({ visible, onClose, onPlayAnother, onExit }: SolvedOverlayProps) {
  const { theme } = useTheme()
  const elapsed = useGameStore((s) => s.elapsedSeconds)
  const difficulty = useGameStore((s) => s.difficulty)

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
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
          onStartShouldSetResponder={() => true}
        >
          <View style={{ alignItems: 'center' }}>
            <PartyPopper size={48} color={theme.colors.accent} />
          </View>
          <Text
            style={{
              color: theme.colors.foreground,
              fontSize: theme.text['3xl'],
              fontWeight: '700',
              textAlign: 'center',
            }}
          >
            Solved!
          </Text>
          <Text
            style={{
              color: theme.colors.mutedForeground,
              fontSize: theme.text.base,
              textAlign: 'center',
            }}
          >
            {difficulty ? `${difficulty.rating} · ` : ''}
            {formatElapsed(elapsed)}
          </Text>
          <View style={{ height: theme.spacing[2] }} />
          {onPlayAnother ? <Button label="Play another" onPress={onPlayAnother} fullWidth /> : null}
          {onExit ? <Button label="Back to home" variant="secondary" onPress={onExit} fullWidth /> : null}
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
