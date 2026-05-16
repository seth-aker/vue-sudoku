import { StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '@/src/theme/ThemeProvider';

import { ThemedText } from './ThemedText';

export function Card({ style, ...rest }: ViewProps) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
        },
        style,
      ]}
      {...rest}
    />
  );
}

export function CardHeader({ style, ...rest }: ViewProps) {
  return <View style={[styles.header, style]} {...rest} />;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <ThemedText variant="title">{children}</ThemedText>;
}

export function CardDescription({ children }: { children: React.ReactNode }) {
  return <ThemedText variant="muted">{children}</ThemedText>;
}

export function CardContent({ style, ...rest }: ViewProps) {
  return <View style={[styles.content, style]} {...rest} />;
}

export function CardFooter({ style, ...rest }: ViewProps) {
  return <View style={[styles.footer, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, padding: 20 },
  header: { alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 12 },
  content: { alignItems: 'center', justifyContent: 'center', gap: 8 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 },
});
