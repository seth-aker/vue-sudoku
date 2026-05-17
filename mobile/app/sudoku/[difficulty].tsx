import { useCallback, useEffect, useState } from 'react'
import { Alert, AppState, type AppStateStatus, Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { isDifficultyRoute } from '@/config'
import { makeStyles, useTheme } from '@/theme'
import {
  formatElapsed,
  selectIsPuzzleSolved,
  toast,
  useGameStore,
} from '@/stores'
import {
  LoadingOverlay,
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
 * Header layout matches the Vue web's Standard.vue:
 *
 *   ┌──────────────────────────────────────────────────────────┐
 *   │ Easy   12:34   [▶/⏸]   [?]    [Reset]                    │
 *   └──────────────────────────────────────────────────────────┘
 *
 * Reset opens a confirmation dialog. (?) opens a small instructions modal.
 */
export default function SudokuScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ difficulty: string }>()
  const styles = useStyles()
  const { theme } = useTheme()

  const loading = useGameStore((s) => s.loading)
  const status = useGameStore((s) => s.status)
  const elapsed = useGameStore((s) => s.elapsedSeconds)
  const isSolved = useGameStore(selectIsPuzzleSolved)
  const getNewPuzzle = useGameStore((s) => s.getNewPuzzle)
  const saveGameState = useGameStore((s) => s.saveGameState)
  const pauseGame = useGameStore((s) => s.pauseGame)
  const resumeGame = useGameStore((s) => s.resumeGame)
  const tickSecond = useGameStore((s) => s.tickSecond)
  const resetPuzzle = useGameStore((s) => s.resetPuzzle)
  const reset = useGameStore((s) => s.reset)

  const [helpOpen, setHelpOpen] = useState(false)

  // ─── route param validation ────────────────────────────────────────────────
  useEffect(() => {
    if (!isDifficultyRoute(params.difficulty)) {
      router.replace('/')
    }
  }, [params.difficulty, router])

  // ─── fetch puzzle on mount unless one is already loaded for this difficulty ───
  // A "Resume" navigation from Home pre-loads the puzzle via getUserPuzzle and
  // then routes here; we DON'T want to clobber it with a fresh getNewPuzzle.
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

  // ─── 1-second timer + 10s auto-save ────────────────────────────────────────
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
        void saveGameState()
      }
    }, [saveGameState]),
  )

  const onReset = () => {
    Alert.alert(
      'Reset puzzle?',
      'This action cannot be undone, are you sure you want to continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => resetPuzzle() },
      ],
    )
  }

  if (!isDifficultyRoute(params.difficulty)) {
    return null
  }

  const isPlaying = status === 'playing'

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      {/* Header — single-row strip with title, timer, pause/play, help, reset.
          Light gray background in light mode; theme.accent in dark mode (matches web's
          `bg-gray-50 dark:bg-accent`). */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {params.difficulty.charAt(0).toUpperCase() + params.difficulty.substring(1)}
        </Text>
        <Text style={styles.timer}>{formatElapsed(elapsed)}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pause' : 'Resume'}
          onPress={() => (isPlaying ? pauseGame() : resumeGame())}
          style={({ pressed }) => [
            styles.headerIconBtn,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <MaterialIcons
            name={isPlaying ? 'pause' : 'play-arrow'}
            size={22}
            color={theme.colors.foreground}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Help"
          onPress={() => setHelpOpen(true)}
          style={({ pressed }) => [styles.headerIconBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <MaterialIcons name="help-outline" size={22} color={theme.colors.foreground} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset puzzle"
          onPress={onReset}
          style={({ pressed }) => [styles.resetBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <SudokuBoard style={{ marginVertical: theme.spacing[4] }} />
        <SudokuControls />
      </View>

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
          /* Tapping the backdrop dismisses but the solved board stays. */
        }}
        onPlayAnother={() => {
          if (!isDifficultyRoute(params.difficulty)) return
          void getNewPuzzle(params.difficulty)
        }}
        onExit={() => {
          reset()
          router.replace('/')
        }}
      />

      <HelpModal visible={helpOpen} onClose={() => setHelpOpen(false)} />
    </ScrollView>
  )
}

/** Touch-equivalent of the web's keyboard-controls help popover. */
function HelpModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { theme } = useTheme()
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <View
          onStartShouldSetResponder={() => true}
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: theme.radius.lg,
            padding: theme.spacing[5],
            gap: theme.spacing[2],
            width: '100%',
            maxWidth: 360,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text
            style={{ fontSize: theme.text.lg, fontWeight: '700', color: theme.colors.foreground }}
          >
            Controls
          </Text>
          {[
            ['Tap a cell', 'Select it; tap a number to fill.'],
            ['Tap the same number again', 'Clear the cell.'],
            ['Pencil mode (✎)', 'Numbers toggle as candidates instead of values.'],
            ['Auto-fill candidates', 'Auto-populates candidates for every empty cell.'],
            ['Undo / Redo', 'Step backward / forward through your moves.'],
          ].map(([label, body]) => (
            <View key={label} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <Text
                style={{
                  fontSize: theme.text.xs,
                  fontWeight: '700',
                  color: theme.colors.foreground,
                  marginRight: 4,
                }}
              >
                {label}:
              </Text>
              <Text
                style={{ fontSize: theme.text.xs, color: theme.colors.foreground, flexShrink: 1 }}
              >
                {body}
              </Text>
            </View>
          ))}
        </View>
      </Pressable>
    </Modal>
  )
}

const useStyles = makeStyles((t) => ({
  scroll: {
    flex: 1,
    backgroundColor: t.colors.background,
  },
  scrollContent: {
    paddingBottom: t.spacing[8],
  },
  body: {
    paddingHorizontal: t.spacing[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: t.spacing[2],
    paddingHorizontal: t.spacing[3],
    backgroundColor: t.mode === 'dark' ? t.colors.accent : '#f9fafb', // gray-50 in light
    gap: t.spacing[2],
  },
  title: {
    fontSize: t.text.base,
    color: t.colors.foreground,
    fontWeight: '500',
  },
  timer: {
    fontSize: t.text.base,
    color: t.colors.foreground,
    fontVariant: ['tabular-nums'],
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtn: {
    paddingHorizontal: t.spacing[2],
    paddingVertical: t.spacing[1],
  },
  resetText: {
    fontSize: t.text.sm,
    color: t.colors.foreground,
  },
}))
