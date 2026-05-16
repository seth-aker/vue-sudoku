import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import { STORAGE_KEYS, storage } from '@/src/lib/storage';
import { buildTheme, type ColorScheme, type Theme } from '@/src/theme';

interface ThemeContextValue {
  theme: Theme;
  scheme: ColorScheme;
  /** True when the user has explicitly chosen a scheme (vs. following the OS). */
  isOverridden: boolean;
  /** Toggle light/dark and persist the choice. */
  toggleScheme: () => void;
  /** Clear the manual override and follow the OS again. */
  useSystemScheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = (useSystemColorScheme() ?? 'light') as ColorScheme;
  const [override, setOverride] = useState<ColorScheme | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    storage
      .getItem<ColorScheme>(STORAGE_KEYS.colorSchemeOverride)
      .then((stored) => {
        if (active && (stored === 'light' || stored === 'dark')) {
          setOverride(stored);
        }
      })
      .finally(() => active && setHydrated(true));
    return () => {
      active = false;
    };
  }, []);

  const scheme: ColorScheme = override ?? systemScheme;

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: buildTheme(scheme),
      scheme,
      isOverridden: override !== null,
      toggleScheme: () => {
        const next: ColorScheme = scheme === 'dark' ? 'light' : 'dark';
        setOverride(next);
        void storage.setItem(STORAGE_KEYS.colorSchemeOverride, next);
      },
      useSystemScheme: () => {
        setOverride(null);
        void storage.removeItem(STORAGE_KEYS.colorSchemeOverride);
      },
    }),
    [scheme, override],
  );

  // Avoid a flash of the wrong theme before the persisted override loads.
  if (!hydrated) return null;

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
