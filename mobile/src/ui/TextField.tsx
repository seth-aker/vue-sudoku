import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { useTheme } from '@/src/theme/ThemeProvider';

import { ThemedText } from './ThemedText';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  /** Rendered at the inline end (e.g. a show/hide password button). */
  rightSlot?: React.ReactNode;
}

export function TextField({
  label,
  error,
  rightSlot,
  style,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {label ? (
        <ThemedText variant="muted" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error
              ? theme.colors.danger
              : focused
                ? theme.colors.accent
                : theme.colors.border,
            borderRadius: theme.radius.md,
          },
        ]}>
        <TextInput
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.input, { color: theme.colors.text }, style]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {rightSlot ? <View style={styles.right}>{rightSlot}</View> : null}
      </View>
      {error ? (
        <ThemedText
          variant="muted"
          style={[styles.error, { color: theme.colors.danger }]}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  label: { marginLeft: 2 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  input: { flex: 1, paddingVertical: 10, fontSize: 15 },
  right: { paddingLeft: 8 },
  error: { marginLeft: 2 },
});
