import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { Moon, Sun, SunMoon } from 'lucide-react-native'
import { makeStyles, useTheme, type ThemeMode } from '@/theme'
import { type DifficultyRoute } from '@/config'
import { Button } from '@/components/ui'
import { AuthSheet } from '@/components/auth'
import { selectIsAuthenticated, toast, useGameStore, useUserStore } from '@/stores'

/**
 * Home screen. Mirrors HomeView.vue:
 *   - centered Card
 *   - title "Sudoku" (text-4xl)
 *   - description "Pick a difficulty to get started"
 *   - vertically stacked equal-width (w-52 = 208px) buttons:
 *       Resume Game (only when authed AND there's a currentPuzzleId)
 *       Beginner / Easy / Medium / Hard (disabled) / Impossible (disabled)
 *
 * Sign-in/out + theme toggle live above the card in a small top bar.
 */
export default function HomeScreen() {
  const styles = useStyles()
  const router = useRouter()
  const { theme, mode, setMode } = useTheme()

  const isAuthed = useUserStore(selectIsAuthenticated)
  const displayName = useUserStore((s) => s.displayName ?? s.username)
  const currentPuzzleId = useUserStore((s) => s.currentPuzzleId)
  const logout = useUserStore((s) => s.logout)

  const getUserPuzzle = useGameStore((s) => s.getUserPuzzle)
  const gameLoading = useGameStore((s) => s.loading)

  const [authOpen, setAuthOpen] = useState(false)

  const cycleTheme = () => {
    const next: ThemeMode = mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system'
    setMode(next)
  }

  const onResume = async () => {
    if (!currentPuzzleId) return
    const res = await getUserPuzzle(currentPuzzleId)
    if (!res.ok) {
      toast.error(res.message ?? 'Could not resume puzzle')
      return
    }
    const rating = useGameStore.getState().difficulty?.rating
    if (!rating) {
      toast.error('Could not determine difficulty for resumed puzzle')
      return
    }
    router.push({ pathname: '/sudoku/[difficulty]', params: { difficulty: rating } })
  }

  const goToPuzzle = (difficulty: DifficultyRoute) => {
    router.push({ pathname: '/sudoku/[difficulty]', params: { difficulty } })
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Top bar — logo on the left, theme + auth on the right. */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>Sudoku</Text>
        <View style={styles.topBarRight}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Theme: ${mode}. Tap to cycle.`}
            onPress={cycleTheme}
            style={({ pressed }) => [
              styles.iconBtn,
              {
                backgroundColor: pressed ? theme.colors.muted : 'transparent',
                borderColor: theme.colors.border,
              },
            ]}
          >
            <ThemeIcon mode={mode} color={theme.colors.foreground} />
          </Pressable>
          {isAuthed ? (
            <Button
              label="Sign out"
              variant="link"
              size="sm"
              onPress={async () => {
                await logout()
                toast.info('Signed out')
              }}
            />
          ) : (
            <Button label="Sign in" variant="link" size="sm" onPress={() => setAuthOpen(true)} />
          )}
        </View>
      </View>

      <View style={styles.cardWrap}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sudoku</Text>
          <Text style={styles.cardDescription}>
            {isAuthed && displayName
              ? `Welcome back, ${displayName}`
              : 'Pick a difficulty to get started'}
          </Text>

          <View style={styles.buttonStack}>
            {isAuthed && currentPuzzleId ? (
              <Button
                label={gameLoading ? 'Loading…' : 'Resume Game'}
                onPress={onResume}
                loading={gameLoading}
                style={styles.cardButton}
              />
            ) : null}
            <Button label="Beginner" onPress={() => goToPuzzle('beginner')} style={styles.cardButton} />
            <Button label="Easy" onPress={() => goToPuzzle('easy')} style={styles.cardButton} />
            <Button label="Medium" onPress={() => goToPuzzle('medium')} style={styles.cardButton} />
            <Button label="Hard (Coming Soon!)" disabled onPress={() => {}} style={styles.cardButton} />
            <Button
              label="Impossible (Coming Soon!)"
              disabled
              onPress={() => {}}
              style={styles.cardButton}
            />
          </View>
        </View>
      </View>

      <Link href="/about" asChild>
        <Pressable style={styles.aboutLink}>
          <Text style={{ color: theme.colors.mutedForeground }}>About</Text>
        </Pressable>
      </Link>

      <AuthSheet visible={authOpen} onClose={() => setAuthOpen(false)} />
    </ScrollView>
  )
}

function ThemeIcon({ mode, color }: { mode: ThemeMode; color: string }) {
  if (mode === 'light') return <Sun size={18} color={color} />
  if (mode === 'dark') return <Moon size={18} color={color} />
  return <SunMoon size={18} color={color} />
}

const useStyles = makeStyles((t) => ({
  scroll: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  content: {
    paddingBottom: t.spacing[8],
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: t.spacing[4],
    paddingTop: t.spacing[4],
    paddingBottom: t.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: t.colors.border,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[2],
  },
  logo: {
    fontSize: t.text['3xl'],
    fontWeight: '700',
    color: t.colors.brand,         // orange-400 (web parity)
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.md,
    borderWidth: 1,
  },
  cardWrap: {
    alignItems: 'center',
    paddingHorizontal: t.spacing[6],
    paddingTop: t.spacing[12],
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.radius.xl,
    backgroundColor: t.colors.card,
    paddingVertical: t.spacing[6],
    paddingHorizontal: t.spacing[4],
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: t.text['4xl'],
    fontWeight: '700',
    color: t.colors.foreground,
  },
  cardDescription: {
    fontSize: t.text.sm,
    color: t.colors.mutedForeground,
    marginTop: t.spacing[1],
    marginBottom: t.spacing[5],
    textAlign: 'center',
  },
  buttonStack: {
    alignItems: 'center',
    width: '100%',
    gap: t.spacing[1],
  },
  cardButton: {
    width: 208,            // w-52 in Tailwind
  },
  aboutLink: {
    marginTop: t.spacing[8],
    alignSelf: 'center',
    padding: t.spacing[2],
  },
}))
