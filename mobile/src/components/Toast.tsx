import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useToastStore, type ToastVariant } from '@/stores'
import { useTheme } from '@/theme'

/**
 * Tiny custom toast — mounted once at the root layout. Reads the current
 * toast from useToastStore, fades in, holds for 3s, fades out. Replaces a
 * full toast library (sonner-native / react-native-toast-message) for ~50
 * lines and zero native deps.
 *
 * Only one toast is visible at a time. Showing a new toast while one is
 * visible cancels the previous and starts fresh.
 */
const VISIBLE_MS = 3000
const FADE_MS = 180

export function Toast() {
  const current = useToastStore((s) => s.current)
  const dismiss = useToastStore((s) => s.dismiss)
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!current) return
    const id = current.id

    Animated.timing(opacity, {
      toValue: 1,
      duration: FADE_MS,
      useNativeDriver: true,
    }).start()

    const t = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_MS,
        useNativeDriver: true,
      }).start(({ finished }) => {
        // Only clear if this is still the current toast (avoid clobbering a newer one).
        if (finished) dismiss(id)
      })
    }, VISIBLE_MS)

    return () => clearTimeout(t)
  }, [current?.id, opacity, dismiss])

  if (!current) return null

  const colors = variantColors(current.variant, theme.colors)

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.container,
        { top: insets.top + 8, opacity },
      ]}
    >
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: colors.bg,
            borderColor: colors.border,
            borderRadius: theme.radius.lg,
            paddingHorizontal: theme.spacing[4],
            paddingVertical: theme.spacing[3],
            maxWidth: 480,
          },
        ]}
      >
        <Text style={{ color: colors.fg, fontSize: theme.text.sm, lineHeight: 20 }}>
          {current.message}
        </Text>
      </View>
    </Animated.View>
  )
}

function variantColors(
  variant: ToastVariant,
  c: ReturnType<typeof useTheme>['theme']['colors'],
): { bg: string; fg: string; border: string } {
  switch (variant) {
    case 'success':
      return { bg: c.primary, fg: c.primaryForeground, border: c.primary }
    case 'error':
      return { bg: c.destructive, fg: c.destructiveForeground, border: c.destructive }
    case 'info':
    default:
      return { bg: c.card, fg: c.cardForeground, border: c.border }
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  bubble: {
    borderWidth: 1,
    // shadow (iOS) + elevation (Android)
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
})
