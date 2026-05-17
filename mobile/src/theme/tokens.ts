/**
 * Light / dark theme tokens.
 *
 * These mirror the colors used by the Vue web app
 * (`frontend/src/assets/main.css` for shadcn tokens + Tailwind utility classes
 * sprinkled in the components themselves) so the mobile UI looks the same.
 *
 * A couple of choices worth flagging:
 *   - Orange-400 is the brand accent (logo, selected cell, pencil-active toggle,
 *     login submit). Orange-200 / orange-300 are the peer-highlight tints.
 *   - The sudoku cells stay "paper-light" in BOTH modes (the web's choice via
 *     `bg-white dark:bg-primary` where dark primary is near-white). We match.
 *   - Cell errors are rendered as RED TEXT, not a red background.
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
  sm: 6,
  md: 8,
  lg: 10,
  xl: 14,
  full: 9999,
} as const

type Colors = {
  // shadcn token set
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

  // Brand accent (orange-400 family). Used on logo, login submit, pencil-active.
  readonly brand: string
  readonly brandActive: string

  // Sudoku-board palette. These stay the same across modes mostly, since the
  // web keeps the board paper-light in dark mode too.
  readonly cellBg: string            // unselected, unhighlighted cell bg
  readonly cellText: string          // digit color (default)
  readonly cellTextError: string     // digit color when in error
  readonly cellSelected: string      // bg of the tapped cell
  readonly cellHighlight: string     // bg of peer cells (same row/col/block)
  readonly cellOutline: string       // 1px border between cells within a block
  readonly boardOuter: string        // 3px frame around the whole board
  readonly boardInner: string        // 3px gap between 3x3 blocks
}

const ORANGE_200 = '#fed7aa'
const ORANGE_300 = '#fdba74'
const ORANGE_400 = '#fb923c'
const RED_600 = '#dc2626'

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

  accent: '#f5f5f5',
  accentForeground: '#171717',

  destructive: '#ef4444',
  destructiveForeground: '#ffffff',

  border: '#e5e5e5',
  input: '#e5e5e5',
  ring: '#a3a3a3',

  brand: ORANGE_400,
  brandActive: ORANGE_400,

  cellBg: '#ffffff',
  cellText: '#000000',
  cellTextError: RED_600,
  cellSelected: ORANGE_400,
  cellHighlight: ORANGE_200,
  cellOutline: '#d1d5db',        // gray-300
  boardOuter: '#000000',
  boardInner: '#6b7280',         // gray-500
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

  destructive: '#991b1b',
  destructiveForeground: '#ffffff',

  border: '#262626',
  input: '#262626',
  ring: '#525252',

  brand: ORANGE_400,
  brandActive: ORANGE_400,

  // Board itself stays paper-light in dark mode (web's choice via dark:bg-primary).
  cellBg: '#fafafa',
  cellText: '#000000',
  cellTextError: RED_600,
  cellSelected: ORANGE_400,
  cellHighlight: ORANGE_300,
  cellOutline: '#0a0a0a',
  boardOuter: '#000000',
  boardInner: '#0a0a0a',
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
