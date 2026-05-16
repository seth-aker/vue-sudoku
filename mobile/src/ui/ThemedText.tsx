import { StyleSheet, Text, type TextProps } from 'react-native';

import { useTheme } from '@/src/theme/ThemeProvider';

type Variant = 'title' | 'subtitle' | 'body' | 'muted' | 'accent';

interface Props extends TextProps {
  variant?: Variant;
}

export function ThemedText({ variant = 'body', style, ...rest }: Props) {
  const { theme } = useTheme();
  const color =
    variant === 'muted'
      ? theme.colors.textMuted
      : variant === 'accent'
        ? theme.colors.accent
        : theme.colors.text;
  return (
    <Text
      style={[styles[variant], { color }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 36, fontWeight: 'bold' },
  subtitle: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 15 },
  muted: { fontSize: 13 },
  accent: { fontSize: 15, fontWeight: '600' },
});
