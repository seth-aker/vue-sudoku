import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/src/theme/ThemeProvider';

import { ThemedText } from './ThemedText';

interface Props {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, disabled }: Props) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={() => !disabled && onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: !!disabled }}
      accessibilityLabel={label}
      style={[styles.row, { opacity: disabled ? 0.5 : 1 }]}>
      <View
        style={[
          styles.box,
          {
            borderColor: checked ? theme.colors.accent : theme.colors.border,
            backgroundColor: checked ? theme.colors.accent : 'transparent',
            borderRadius: theme.radius.sm,
          },
        ]}>
        {checked ? (
          <Ionicons name="checkmark" size={14} color={theme.colors.onAccent} />
        ) : null}
      </View>
      {label ? (
        <ThemedText variant="muted" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  box: {
    width: 20,
    height: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { marginLeft: 2 },
});
