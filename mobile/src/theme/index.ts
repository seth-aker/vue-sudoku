/**
 * Theme tokens. No NativeWind — plain objects consumed via StyleSheet and the
 * useTheme() hook. Mirrors the web app's orange accent + light/dark palettes.
 */

export type ColorScheme = 'light' | 'dark';

/** Orange accent scale (matches the web Tailwind orange-* used in the Vue app). */
export const orange = {
  200: '#fed7aa',
  300: '#fdba74',
  400: '#fb923c',
  500: '#f97316',
} as const;

export interface ThemeColors {
  background: string;
  surface: string;
  /** Slightly raised surface (cards, headers). */
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  /** Brand / primary action color. */
  accent: string;
  accentMuted: string;
  /** Text/icon color rendered on top of `accent`. */
  onAccent: string;
  /** Sudoku grid specifics. */
  gridLine: string;
  cellBackground: string;
  cellHighlighted: string;
  cellSelected: string;
  cellText: string;
  cellError: string;
  overlay: string;
  danger: string;
}

const light: ThemeColors = {
  background: '#ffffff',
  surface: '#ffffff',
  surfaceAlt: '#f8fafc',
  text: '#0a0a0a',
  textMuted: '#64748b',
  border: '#e2e8f0',
  accent: orange[400],
  accentMuted: orange[300],
  onAccent: '#0a0a0a',
  gridLine: '#000000',
  cellBackground: '#ffffff',
  cellHighlighted: orange[200],
  cellSelected: orange[400],
  cellText: '#0a0a0a',
  cellError: '#dc2626',
  overlay: 'rgba(0,0,0,0.4)',
  danger: '#dc2626',
};

const dark: ThemeColors = {
  background: '#0a0a0a',
  surface: '#171717',
  surfaceAlt: '#1f1f1f',
  text: '#ededed',
  textMuted: '#9ca3af',
  border: '#2a2a2a',
  accent: orange[400],
  accentMuted: orange[300],
  onAccent: '#0a0a0a',
  gridLine: '#000000',
  cellBackground: '#1f1f1f',
  cellHighlighted: orange[300],
  cellSelected: orange[400],
  cellText: '#0a0a0a',
  cellError: '#ef4444',
  overlay: 'rgba(0,0,0,0.6)',
  danger: '#ef4444',
};

export const palettes: Record<ColorScheme, ThemeColors> = { light, dark };

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 9999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 24,
  xxl: 36,
} as const;

export interface Theme {
  scheme: ColorScheme;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
}

export function buildTheme(scheme: ColorScheme): Theme {
  return { scheme, colors: palettes[scheme], spacing, radius, fontSize };
}
