import { useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { useTheme } from './ThemeProvider'
import type { Theme } from './tokens'

/**
 * Helper for theme-aware StyleSheets. Use it like StyleSheet.create:
 *
 *   const useStyles = makeStyles((theme) => ({
 *     container: { backgroundColor: theme.colors.background, padding: theme.spacing[4] },
 *     title: { color: theme.colors.foreground, fontSize: theme.text['2xl'] },
 *   }))
 *
 *   function MyView() {
 *     const styles = useStyles()
 *     return <View style={styles.container}>...</View>
 *   }
 *
 * The styles object is memoized per-theme so it only re-creates when the
 * active theme changes (light <-> dark or system swap), not on every render.
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  builder: (theme: Theme) => T,
): () => T {
  return function useStyles(): T {
    const { theme } = useTheme()
    // theme objects are stable per mode, so this only re-runs on a mode swap.
    return useMemo(() => StyleSheet.create(builder(theme)), [theme])
  }
}
