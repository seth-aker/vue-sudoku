import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { Moon, Sun, SunMoon } from 'lucide-react-native'
import { makeStyles, useTheme, type ThemeMode } from '@/theme'
import { PUZZLE_DIFFICULTY_ROUTES } from '@/config'
import { Button } from '@/components/ui'
import { AuthSheet } from '@/components/auth'
import { selectIsAuthenticated, toast, useGameStore, useUserStore } from '@/stores'

/**
 * Home / difficulty picker. Shows:
 *  - greeting + sign-in/out
 *  - small theme toggle (light → dark → system cycle)
 *  - Resume button when the signed-in user has a currentPuzzleId
 *  - difficulty cards
 *  - About link
 */
export default function HomeScreen() {
  const styles = useStyles()
  const { theme, mode, setMode } = useTheme()
  const router = useRouter()

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

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>Sudoku Chive</Text>
          <Text style={styles.subhead}>
            {isAuthed && displayName ? `Hi, ${displayName}` : 'Pick a difficulty'}
          </Text>
        </View>
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
            variant="ghost"
            size="sm"
            onPress={async () => {
              await logout()
              toast.info('Signed out')
            }}
          />
        ) : (
          <Button label="Sign in" variant="secondary" size="sm" onPress={() => setAuthOpen(true)} />
        )}
      </View>

      {isAuthed && currentPuzzleId ? (
        <View style={styles.resumeRow}>
          <Button
            label={gameLoading ? 'Resuming…' : 'Resume puzzle'}
            variant="primary"
            onPress={onResume}
            loading={gameLoading}
            fullWidth
          />
        </View>
      ) : null}

      <View style={styles.list}>
        {PUZZLE_DIFFICULTY_ROUTES.map((d) => (
          <Link key={d} href={{ pathname: '/sudoku/[difficulty]', params: { difficulty: d } }} asChild>
            <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
              <Text style={styles.cardTitle}>{d}</Text>
            </Pressable>
          </Link>
        ))}
      </View>

      <Link href="/about" asChild>
        <Pressable style={styles.aboutLink}>
          <Text style={{ color: theme.colors.mutedForeground }}>About</Text>
        </Pressable>
      </Link>

      <AuthSheet visible={authOpen} onClose={() => setAuthOpen(false)} />
    </View>
  )
}

function ThemeIcon({ mode, color }: { mode: ThemeMode; color: string }) {
  if (mode === 'light') return <Sun size={18} color={color} />
  if (mode === 'dark') return <Moon size={18} color={color} />
  return <SunMoon size={18} color={color} />
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    padding: t.spacing[6],
    backgroundColor: t.colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[2],
    marginTop: t.spacing[6],
    marginBottom: t.spacing[6],
  },
  heading: {
    fontSize: t.text['3xl'],
    fontWeight: '700',
    color: t.colors.foreground,
  },
  subhead: {
    fontSize: t.text.base,
    color: t.colors.mutedForeground,
    marginTop: t.spacing[1],
  },
  resumeRow: {
    marginBottom: t.spacing[5],
  },
  list: {
    gap: t.spacing[3],
  },
  card: {
    padding: t.spacing[5],
    borderRadius: t.radius.lg,
    backgroundColor: t.colors.card,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
  cardPressed: {
    backgroundColor: t.colors.secondary,
  },
  cardTitle: {
    fontSize: t.text.xl,
    color: t.colors.cardForeground,
    textTransform: 'capitalize',
  },
  aboutLink: {
    marginTop: t.spacing[8],
    alignSelf: 'center',
    padding: t.spacing[2],
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.md,
    borderWidth: 1,
  },
}))
