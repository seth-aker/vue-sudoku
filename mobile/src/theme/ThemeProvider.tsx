import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Appearance, useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { darkTheme, lightTheme, type Theme } from './tokens'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'mobile:themeMode'

interface ThemeContextValue {
  /** Resolved theme — never 'system'. Use this in components. */
  theme: Theme
  /** User's stored preference, including 'system'. */
  mode: ThemeMode
  /** Update the preference and persist it. */
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

interface ThemeProviderProps {
  children: React.ReactNode
  /** Override the initial mode (mostly for tests). */
  initialMode?: ThemeMode
}

/** Normalize React Native's ColorSchemeName ('light' | 'dark' | 'unspecified' | null) to our two-value scheme. */
function normalizeScheme(scheme: 'light' | 'dark' | 'unspecified' | null | undefined): 'light' | 'dark' {
  return scheme === 'dark' ? 'dark' : 'light'
}

export function ThemeProvider({ children, initialMode = 'system' }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(initialMode)
  const systemScheme = normalizeScheme(useColorScheme() ?? Appearance.getColorScheme())

  // Hydrate from storage once on mount.
  useEffect(() => {
    let cancelled = false
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (cancelled || !stored) return
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setModeState(stored)
        }
      })
      .catch(() => {
        // Ignore: fall back to initialMode.
      })
    return () => {
      cancelled = true
    }
  }, [])

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next)
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // Persistence is best-effort. Don't fail the UI on a storage error.
    })
  }, [])

  const resolvedScheme: 'light' | 'dark' = mode === 'system' ? systemScheme : mode
  const theme = resolvedScheme === 'dark' ? darkTheme : lightTheme

  const value = useMemo<ThemeContextValue>(() => ({ theme, mode, setMode }), [theme, mode, setMode])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
