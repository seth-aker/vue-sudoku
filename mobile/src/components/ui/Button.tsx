import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps, type ViewStyle, type TextStyle } from 'react-native'
import { useTheme } from '@/theme'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  style?: ViewStyle
}

/**
 * Themed button. Phase 4 scope is intentionally narrow — variants and sizes
 * cover what the auth forms need. Phase 5 will extend (icons, link variant)
 * but the API is stable from here.
 */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const { theme } = useTheme()
  const isDisabled = disabled || loading

  const v = variantStyles(variant, theme.colors, isDisabled)
  const s = sizeStyles(size, theme)

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: pressed && !isDisabled ? v.pressedBg : v.bg,
          borderColor: v.border,
          borderRadius: theme.radius.md,
          paddingHorizontal: s.paddingX,
          paddingVertical: s.paddingY,
          opacity: isDisabled && !loading ? 0.5 : 1,
        },
        fullWidth && { alignSelf: 'stretch' },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} size="small" />
      ) : (
        <Text style={{ color: v.fg, fontSize: s.fontSize, fontWeight: '600' }}>{label}</Text>
      )}
    </Pressable>
  )
}

function variantStyles(
  variant: ButtonVariant,
  c: ReturnType<typeof useTheme>['theme']['colors'],
  _disabled: boolean,
): { bg: string; pressedBg: string; fg: string; border: string } {
  switch (variant) {
    case 'primary':
      return { bg: c.primary, pressedBg: c.foreground, fg: c.primaryForeground, border: c.primary }
    case 'secondary':
      return { bg: c.secondary, pressedBg: c.muted, fg: c.secondaryForeground, border: c.border }
    case 'destructive':
      return { bg: c.destructive, pressedBg: c.destructive, fg: c.destructiveForeground, border: c.destructive }
    case 'ghost':
      return { bg: 'transparent', pressedBg: c.muted, fg: c.foreground, border: 'transparent' }
  }
}

function sizeStyles(
  size: ButtonSize,
  t: ReturnType<typeof useTheme>['theme'],
): { paddingX: number; paddingY: number; fontSize: number } {
  switch (size) {
    case 'sm':
      return { paddingX: t.spacing[3], paddingY: t.spacing[1], fontSize: t.text.sm }
    case 'md':
      return { paddingX: t.spacing[4], paddingY: t.spacing[2], fontSize: t.text.base }
    case 'lg':
      return { paddingX: t.spacing[5], paddingY: t.spacing[3], fontSize: t.text.lg }
  }
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  } as ViewStyle,
})

// Keep TextStyle import "used" for downstream consumers that may want to share it.
export type { TextStyle }
