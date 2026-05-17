import { forwardRef } from 'react'
import { StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native'
import { useTheme } from '@/theme'

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string
  helperText?: string
  errorText?: string
  containerStyle?: ViewStyle
}

/**
 * Themed text input with optional label + helper/error text underneath.
 * Phase 4 scope: just enough to power the login + register forms. Phase 5
 * may add affixes / leading icons.
 */
export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, helperText, errorText, containerStyle, editable, ...rest },
  ref,
) {
  const { theme } = useTheme()
  const c = theme.colors
  const hasError = !!errorText

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={{ color: c.foreground, fontSize: theme.text.sm, marginBottom: theme.spacing[1] }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        editable={editable}
        placeholderTextColor={c.mutedForeground}
        selectionColor={c.ring}
        accessibilityLabel={label}
        style={[
          styles.input,
          {
            color: c.foreground,
            backgroundColor: c.card,
            borderColor: hasError ? c.destructive : c.input,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing[3],
            paddingVertical: theme.spacing[2],
            fontSize: theme.text.base,
            opacity: editable === false ? 0.6 : 1,
          },
        ]}
        {...rest}
      />
      {hasError ? (
        <Text style={{ color: c.destructive, fontSize: theme.text.xs, marginTop: theme.spacing[1] }}>
          {errorText}
        </Text>
      ) : helperText ? (
        <Text style={{ color: c.mutedForeground, fontSize: theme.text.xs, marginTop: theme.spacing[1] }}>
          {helperText}
        </Text>
      ) : null}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    width: '100%',
  } as ViewStyle,
  input: {
    borderWidth: 1,
    minHeight: 44,
  },
})
