import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '@/src/theme/ThemeProvider';
import { ThemedText } from '@/src/ui';

export function LoadingOverlay({ message = 'Loading…' }: { message?: string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
      <View
        style={[
          styles.box,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.lg,
          },
        ]}>
        <ActivityIndicator color={theme.colors.accent} />
        <ThemedText variant="body">{message}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderWidth: 1,
  },
});
