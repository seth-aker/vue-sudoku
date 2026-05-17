import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { useTheme } from '@/theme'

interface LoadingOverlayProps {
  visible: boolean
  message?: string
}

/**
 * Inline (non-modal) loading overlay. Renders absolutely over the parent
 * so the screen doesn't reflow when toggled.
 */
export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  const { theme } = useTheme()
  if (!visible) return null
  return (
    <View
      pointerEvents="auto"
      style={[styles.overlay, { backgroundColor: theme.colors.background + 'cc' }]}
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message ? (
        <Text style={{ color: theme.colors.foreground, fontSize: theme.text.base, marginTop: 12 }}>
          {message}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
