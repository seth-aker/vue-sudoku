import { Pressable, StyleSheet, View } from 'react-native'
import { Check } from 'lucide-react-native'
import { useTheme } from '@/theme'

export interface CheckboxProps {
  checked: boolean
  onCheckedChange: (next: boolean) => void
  disabled?: boolean
  /** Optional id for accessibility / label association. */
  accessibilityLabel?: string
}

/**
 * Themed checkbox primitive. ~18×18 pressable square that toggles its checked
 * state and shows a Lucide checkmark when on. Matches the shadcn Checkbox the
 * Vue app uses for "Auto-fill candidates".
 */
export function Checkbox({ checked, onCheckedChange, disabled, accessibilityLabel }: CheckboxProps) {
  const { theme } = useTheme()
  return (
    <Pressable
      onPress={() => !disabled && onCheckedChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      hitSlop={6}
      style={({ pressed }) => [
        styles.box,
        {
          borderColor: checked ? theme.colors.primary : theme.colors.border,
          backgroundColor: checked ? theme.colors.primary : 'transparent',
          opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
          borderRadius: theme.radius.sm - 2,
        },
      ]}
    >
      {checked ? (
        <Check size={14} color={theme.colors.primaryForeground} strokeWidth={3} />
      ) : (
        <View />
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  box: {
    width: 18,
    height: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
