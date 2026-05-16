import {
  Pressable,
  StyleSheet,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/src/theme/ThemeProvider';

interface Props {
  pressed: boolean;
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

/** A two-state toggle button (e.g. pencil mode, play/pause). */
export function Toggle({
  pressed,
  onPress,
  children,
  disabled,
  accessibilityLabel,
  style,
}: Props) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: pressed, disabled: !!disabled }}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.base,
        {
          backgroundColor: pressed ? theme.colors.accent : theme.colors.surfaceAlt,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 44,
    height: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
