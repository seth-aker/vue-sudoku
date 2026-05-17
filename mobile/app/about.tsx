import { ScrollView, useWindowDimensions } from 'react-native'
import Markdown from 'react-native-markdown-display'
import { useTheme, makeStyles } from '@/theme'
import readme from '@/generated/readme'

/**
 * About page. Renders the repo's root README.md, bundled at build time via
 * `scripts/bundle-readme.mjs` into `src/generated/readme.ts`. The bundle is
 * regenerated automatically on `pnpm start` (via the `prestart` script).
 *
 * Uses react-native-markdown-display rather than rolling our own renderer —
 * the README has links, headings, code, and lists, all of which the library
 * handles cleanly with our theme tokens.
 */
export default function AboutScreen() {
  const { theme } = useTheme()
  const styles = useStyles()
  const { width } = useWindowDimensions()

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Markdown style={mdStyle(theme, width)} mergeStyle={false}>
        {readme}
      </Markdown>
    </ScrollView>
  )
}

const useStyles = makeStyles((t) => ({
  scroll: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  content: {
    padding: t.spacing[5],
    paddingBottom: t.spacing[10],
  },
}))

/**
 * react-native-markdown-display uses its own per-element style map keyed by
 * element name. We override the common ones to match our theme.
 */
function mdStyle(theme: ReturnType<typeof useTheme>['theme'], screenWidth: number) {
  const c = theme.colors
  return {
    body: { color: c.foreground, fontSize: theme.text.base },
    heading1: {
      color: c.foreground,
      fontSize: theme.text['3xl'],
      fontWeight: '700' as const,
      marginTop: theme.spacing[4],
      marginBottom: theme.spacing[2],
    },
    heading2: {
      color: c.foreground,
      fontSize: theme.text['2xl'],
      fontWeight: '700' as const,
      marginTop: theme.spacing[4],
      marginBottom: theme.spacing[2],
    },
    heading3: {
      color: c.foreground,
      fontSize: theme.text.xl,
      fontWeight: '600' as const,
      marginTop: theme.spacing[3],
      marginBottom: theme.spacing[1],
    },
    paragraph: { color: c.foreground, lineHeight: 22, marginBottom: theme.spacing[3] },
    link: { color: c.cellEdited, textDecorationLine: 'underline' as const },
    code_inline: {
      backgroundColor: c.muted,
      color: c.foreground,
      paddingHorizontal: 4,
      borderRadius: theme.radius.sm,
      fontFamily: 'monospace',
    },
    fence: {
      backgroundColor: c.muted,
      color: c.foreground,
      padding: theme.spacing[3],
      borderRadius: theme.radius.md,
      fontFamily: 'monospace',
      width: screenWidth - theme.spacing[5] * 2,
    },
    code_block: {
      backgroundColor: c.muted,
      color: c.foreground,
      padding: theme.spacing[3],
      borderRadius: theme.radius.md,
      fontFamily: 'monospace',
    },
    list_item: { color: c.foreground, marginBottom: theme.spacing[1] },
    bullet_list: { marginBottom: theme.spacing[3] },
    ordered_list: { marginBottom: theme.spacing[3] },
    hr: { backgroundColor: c.border, height: 1, marginVertical: theme.spacing[3] },
    blockquote: {
      backgroundColor: c.muted,
      borderLeftColor: c.border,
      borderLeftWidth: 3,
      paddingHorizontal: theme.spacing[3],
      paddingVertical: theme.spacing[2],
      marginVertical: theme.spacing[2],
    },
  }
}
