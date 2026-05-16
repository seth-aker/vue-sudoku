import { Switch as RNSwitch } from 'react-native';

import { useTheme } from '@/src/theme/ThemeProvider';

interface Props {
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export function Switch({
  value,
  onValueChange,
  disabled,
  accessibilityLabel,
}: Props) {
  const { theme } = useTheme();
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      trackColor={{
        false: theme.colors.border,
        true: theme.colors.accentMuted,
      }}
      thumbColor={value ? theme.colors.accent : theme.colors.surface}
    />
  );
}
