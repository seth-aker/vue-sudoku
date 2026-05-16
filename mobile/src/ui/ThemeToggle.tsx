import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/src/theme/ThemeProvider';

import { Toggle } from './Toggle';

/** Dark-mode toggle (persists the override via the ThemeProvider). */
export function ThemeToggle() {
  const { theme, scheme, toggleScheme } = useTheme();
  const dark = scheme === 'dark';
  return (
    <Toggle
      pressed={dark}
      onPress={toggleScheme}
      accessibilityLabel={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <Ionicons
        name={dark ? 'moon' : 'sunny'}
        size={20}
        color={dark ? theme.colors.onAccent : theme.colors.text}
      />
    </Toggle>
  );
}
