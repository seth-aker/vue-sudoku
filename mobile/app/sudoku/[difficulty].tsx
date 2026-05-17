import { useCallback, useEffect } from 'react'
import { AppState, type AppStateStatus, Pressable, ScrollView, Text, View } from 'react-native'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import { Pause, Play } from 'lucide-react-native'
import { isDifficultyRoute } from '@/config'
import { makeStyles, useTheme } from '@/theme'
import {
  formatElapsed,
  selectIsPuzzleSolved,
  toast,
  useGameStore,
  useUserStore,
} from '@/stores'
import {
  LoadingOverlay,
  Numpad,
  PauseMenu,
  SolvedOverlay,
  SudokuBoard,
  SudokuControls,
} from '@/components/game'

/**
 * Game screen. On mount it fetches a new puzzle for the URL difficulty;
 * a 1-second interval drives the timer; AppState background and route-leave
 * both trigger an immediate save.
 *
 * The screen owns the timer interval (not the store) so React effect
 * lifecycles can mount/unmount it cleanly across navigation.
 */
export default function SudokuScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ difficulty: string }>()
  const styles = useStyles()
  const { theme } = useTheme()

  const loading = useGameStore((s) => s.loading)
  const status = useGameStore((s) => s.status)
  const elapsed = useGameStore((s) => s.elapsedSeconds)
  const puzzleId = useGameStore((s) => s.puzzleId)
  const isSolved = useGameStore(selectIsPuzzleSolved)
  const getNewPuzzle = useGameStore((s) => s.getNewPuzzle)
  const saveGameState = useGameStore((s) => s.saveGameState)
  const pauseGame = useGameStore((s) => s.pauseGame)
  const resumeGame = useGameStore((s) => s.resumeGame)
  const tickSecond = useGameStore((s) => s.tickSecond)
  const reset = useGameStore((s) => s.reset)

  // ─── route param validation ────────────────────────────────────────────────
  useEffect(() => {
    if (!isDifficultyRoute(params.difficulty)) {
      router.replace('/')
    }
  }, [params.difficulty, router])

  // ─── fetch puzzle on mount unless one is already loaded for this difficulty ───
  // A "Resume" navigation from Home pre-loads the puzzle via getUserPuzzle and
  // then routes here; we DON'T want to clobber it with a fresh getNewPuzzle.
  // Reading from the store directly (no ref) keeps this resilient to remounts.
  useEffect(() => {
    if (!isDifficultyRoute(params.difficulty)) return
    const s = useGameStore.getState()
    if (s.puzzleId && s.difficulty?.rating === params.difficulty && !s.isCompleted) {
      return
    }
    void getNewPuzzle(params.difficulty).then((res) => {
      if (!res.ok) toast.error(res.message ?? 'Could not load puzzle')
    })
  }, [params.difficulty, getNewPuzzle])

  // ─── 1-second timer driving elapsedSeconds + 10s auto-save ────────────────
  useEffect(() => {
    if (status !== 'playing') return
    const id = setInterval(() => tickSecond(), 1000)
    return () => clearInterval(id)
  }, [status, tickSecond])

  // ─── AppState save on background + cleanup save on screen-leave ───────────
  useFocusEffect(
    useCallback(() => {
      const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
        if (next === 'background' || next === 'inactive') {
          void saveGameState()
          void useGameStore.getState().saveToLocal()
        }
      })
      return () => {
        sub.remove()
        // Final save on leave — fire-and-forget.
        void saveGameState()
      }
    }, [saveGameState]),
  )

  if (!isDifficultyRoute(params.difficulty)) {
    return null
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>{params.difficulty}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.timer}>{formatElapsed(elapsed)}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={status === 'playing' ? 'Pause' : 'Resume'}
            onPress={() => (status === 'playing' ? pauseGame() : resumeGame())}
            style={({ pressed }) => [
              styles.pauseBtn,
              { backgroundColor: pressed ? theme.colors.muted : theme.colors.card },
            ]}
          >
            {status === 'playing' ? (
              <Pause size={20} color={theme.colors.foreground} />
            ) : (
              <Play size={20} color={theme.colors.foreground} />
            )}
          </Pressable>
        </View>
      </View>

      <SudokuBoard style={{ marginVertical: theme.spacing[4] }} />

      <View style={{ height: theme.spacing[3] }} />
      <Numpad />
      <View style={{ height: theme.spacing[4] }} />
      <SudokuControls />

      <LoadingOverlay visible={loading} message="Fetching puzzle…" />

      <PauseMenu
        visible={status === 'paused' && !loading}
        onResume={resumeGame}
        onExit={() => {
          void saveGameState()
          reset()
          router.replace('/')
        }}
      />

      <SolvedOverlay
        visible={isSolved}
        onClose={() => {
          // Tapping the backdrop "dismisses" the overlay but doesn't reset state.
          // The screen still shows the solved board underneath.
        }}
        onPlayAnother={() => {
          // Force a new puzzle of the same difficulty. getNewPuzzle resets all
          // relevant state (cells, puzzleId, status, actions) on success.
          if (!isDifficultyRoute(params.difficulty)) return
          void getNewPuzzle(params.difficulty)
        }}
        onExit={() => {
          reset()
          router.replace('/')
        }}
      />
    </ScrollView>
  )
}

const useStyles = makeStyles((t) => ({
  scroll: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  scrollContent: {
    padding: t.spacing[4],
    paddingBottom: t.spacing[8],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: t.spacing[2],
  },
  title: {
    fontSize: t.text['2xl'],
    fontWeight: '700',
    color: t.colors.foreground,
    textTransform: 'capitalize',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[3],
  },
  timer: {
    fontSize: t.text.lg,
    color: t.colors.foreground,
    fontVariant: ['tabular-nums'],
  },
  pauseBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: t.radius.md,
    borderWidth: 1,
    borderColor: t.colors.border,
  },
}))
