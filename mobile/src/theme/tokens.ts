/**
 * Light / dark theme tokens.
 *
 * These mirror the oklch color tokens from the Vue web app
 * (`frontend/src/assets/main.css`), converted to sRGB hex so React Native can
 * render them. Where the web app used Tailwind's "neutral" scale via oklch,
 * we use the corresponding Tailwind v4 hex values directly. Approximations
 * are within a hair of the rendered web colors.
 *
 * Add new tokens here (not in component files) so light/dark mode swaps for free.
 */

/** Spacing — multiples of 4, named to match Tailwind's spacing scale. */
const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const

/** Type sizes — match Tailwind's text-* scale. */
const text = {
  '2xs': 8,
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const

/** Border radius — derived from the --radius CSS var (0.625rem = 10px). */
const radius = {
  none: 0,
  sm: 6,   // calc(--radius - 4px)
  md: 8,   // calc(--radius - 2px)
  lg: 10,  // --radius
  xl: 14,  // calc(--radius + 4px)
  full: 9999,
} as const

// `Colors` is the structural type for a color palette. We declare it via the
// shape of lightColors below, then re-state darkColors with the same keys so
// both palettes satisfy a single widened type.
type Colors = {
  readonly background: string
  readonly foreground: string
  readonly card: string
  readonly cardForeground: string
  readonly popover: string
  readonly popoverForeground: string
  readonly primary: string
  readonly primaryForeground: string
  readonly secondary: string
  readonly secondaryForeground: string
  readonly muted: string
  readonly mutedForeground: string
  readonly accent: string
  readonly accentForeground: string
  readonly destructive: string
  readonly destructiveForeground: string
  readonly border: string
  readonly input: string
  readonly ring: string
  readonly cellSelected: string
  readonly cellHighlight: string
  readonly cellError: string
  readonly cellPrefilled: string
  readonly cellEdited: string
}

const lightColors: Colors = {
  background: '#ffffff',
  foreground: '#0a0a0a',

  card: '#ffffff',
  cardForeground: '#0a0a0a',

  popover: '#ffffff',
  popoverForeground: '#0a0a0a',

  primary: '#171717',
  primaryForeground: '#fafafa',

  secondary: '#f5f5f5',
  secondaryForeground: '#171717',

  muted: '#f5f5f5',
  mutedForeground: '#737373',

  accent: '#fde68a',           // oklch(0.901 0.076 70.697) ~ amber-200
  accentForeground: '#171717',

  destructive: '#ef4444',      // red-500 — error toast/button background
  destructiveForeground: '#ffffff',  // white text on red

  border: '#e5e5e5',
  input: '#e5e5e5',
  ring: '#a3a3a3',

  // Cell-specific colors used by the sudoku board. Kept here so light/dark
  // swap together. Not part of the original shadcn token set.
  cellSelected: '#dbeafe',     // soft blue
  cellHighlight: '#f3f4f6',    // light gray when in same row/col/block
  cellError: '#fee2e2',        // light red bg for errored cells
  cellPrefilled: '#171717',    // bold text for prefilled cells
  cellEdited: '#3b82f6',       // blue text for user-edited cells
} as const

const darkColors: Colors = {
  background: '#0a0a0a',
  foreground: '#fafafa',

  card: '#0a0a0a',
  cardForeground: '#fafafa',

  popover: '#0a0a0a',
  popoverForeground: '#fafafa',

  primary: '#fafafa',
  primaryForeground: '#171717',

  secondary: '#262626',
  secondaryForeground: '#fafafa',

  muted: '#262626',
  mutedForeground: '#a3a3a3',

  accent: '#262626',
  accentForeground: '#fafafa',

  destructive: '#991b1b',      // red-800 — slightly muted for dark mode
  destructiveForeground: '#ffffff',

  border: '#262626',
  input: '#262626',
  ring: '#525252',

  cellSelected: '#1e3a8a',     // deep blue
  cellHighlight: '#1f1f1f',
  cellError: '#7f1d1d',
  cellPrefilled: '#fafafa',
  cellEdited: '#60a5fa',
} as const

export interface Theme {
  mode: 'light' | 'dark'
  colors: Colors
  spacing: typeof spacing
  text: typeof text
  radius: typeof radius
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: lightColors,
  spacing,
  text,
  radius,
}

export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkColors,
  spacing,
  text,
  radius,
}
