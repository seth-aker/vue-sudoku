import { forwardRef, useState } from 'react'
import { Pressable, StyleSheet, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native'
import { Eye, EyeOff } from 'lucide-react-native'
import { Input, type InputProps } from './Input'
import { useTheme } from '@/theme'

export interface PasswordInputProps extends Omit<InputProps, 'secureTextEntry'> {}

/**
 * Password input with a press-and-hold eye affordance on the right edge —
 * mirrors the Vue web's `useMousePressed` behavior in LoginForm.vue: the
 * password is visible only while the user is actively pressing the eye icon.
 *
 * Stops being plaintext as soon as the press ends (better than a sticky toggle
 * for shoulder-surfing and matches the web).
 */
export const PasswordInput = forwardRef<TextInput, PasswordInputProps>(function PasswordInput(
  { containerStyle, ...rest },
  ref,
) {
  const { theme } = useTheme()
  const [revealed, setRevealed] = useState(false)

  return (
    <View style={[styles.wrap, containerStyle as ViewStyle]}>
      <Input
        ref={ref}
        secureTextEntry={!revealed}
        autoCapitalize="none"
        autoCorrect={false}
        {...rest}
        // Pad the input so the digit doesn't run under the eye icon.
        // We pass through containerStyle separately above; this style hits the field inner.
      />
      <Pressable
        // Position the eye over the input's right edge. Account for the optional
        // label above (~24px) and the optional helper/error below.
        onPressIn={() => setRevealed(true)}
        onPressOut={() => setRevealed(false)}
        accessibilityRole="button"
        accessibilityLabel={revealed ? 'Hide password' : 'Show password (hold)'}
        hitSlop={8}
        style={({ pressed }) => [
          styles.eyeBtn,
          { opacity: pressed ? 0.7 : 1, top: rest.label ? 26 : 2 },
        ]}
      >
        {revealed ? (
          <Eye size={18} color={theme.colors.mutedForeground} />
        ) : (
          <EyeOff size={18} color={theme.colors.mutedForeground} />
        )}
      </Pressable>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    width: '100%',
  },
  eyeBtn: {
    position: 'absolute',
    right: 8,
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
