import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/src/theme/ThemeProvider';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'link'
  | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface Props {
  title?: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  children,
  style,
  accessibilityLabel,
}: Props) {
  const { theme } = useTheme();

  const sizing: ViewStyle =
    size === 'icon'
      ? { width: 44, height: 44, paddingHorizontal: 0 }
      : size === 'sm'
        ? { paddingVertical: 6, paddingHorizontal: 12 }
        : size === 'lg'
          ? { paddingVertical: 14, paddingHorizontal: 22 }
          : { paddingVertical: 10, paddingHorizontal: 16 };

  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: theme.colors.accent, fg: theme.colors.onAccent },
    secondary: { bg: theme.colors.surfaceAlt, fg: theme.colors.text },
    ghost: { bg: 'transparent', fg: theme.colors.text },
    link: { bg: 'transparent', fg: theme.colors.accent },
    outline: {
      bg: 'transparent',
      fg: theme.colors.text,
      border: theme.colors.border,
    },
  };
  const p = palette[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.base,
        sizing,
        {
          backgroundColor: p.bg,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
          borderRadius: theme.radius.md,
          borderWidth: p.border ? 1 : 0,
          borderColor: p.border,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : children ? (
        <View style={styles.row}>{children}</View>
      ) : (
        <Text
          style={[
            styles.label,
            { color: p.fg },
            variant === 'link' && styles.linkLabel,
          ]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: 15, fontWeight: '600' },
  linkLabel: { textDecorationLine: 'underline', fontWeight: '500' },
});
