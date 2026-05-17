import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { sudokuService } from '@/api'
import {
  buildBlankCells,
  cellHasError,
  clearAllCandidates as clearAllCandidatesFn,
  computeCandidates,
  deserializeAction,
  deserializeCells,
  isSolved,
  numberWorksInCell,
  peerIndicesOf,
  serializeAction,
  serializeCandidatesToString,
  serializeCellsToString,
} from '@/game'
import type { Action, Cell, Cells, Difficulty, DifficultyRating, GameStatus } from '@/types'
import { useUserStore } from './useUserStore'

/**
 * The combined "game" store — puzzle data + interaction + timer all in one,
 * per MIGRATION_PLAN §3.5.3. Replaces what used to be two separate Pinia stores
 * (sudokuStore + gameStore) in the Vue app.
 *
 * Auto-save fires every 10s while the timer is running. The screen also wires
 * a save on AppState change and route-leave.
 */
interface GameState {
  // — puzzle data —
  puzzleId: string | null
  cells: Cells                       // length 81
  originalCells: Cells               // length 81 — for reset + 'prefilled' detection
  difficulty: Difficulty | null
  isCompleted: boolean

  // — interaction —
  selectedIdx: number | null
  usingPencil: boolean
  autoCandidateMode: boolean         // when true, placing a value strips it from peer candidates
  actions: Action[]                  // undo stack — newest at the end
  redoActions: Action[]              // redo stack — newest at the end
  loading: boolean
  /** Last failed-save message (if any), surfaced as a one-shot UI hint. */
  saveError: string | null

  // — timer —
  elapsedSeconds: number
  status: GameStatus

  // — actions —
  getNewPuzzle: (difficulty: DifficultyRating) => Promise<{ ok: boolean; message?: string }>
  getUserPuzzle: (puzzleId: string) => Promise<{ ok: boolean; message?: string }>
  saveGameState: () => Promise<{ ok: boolean; message?: string }>
  setCell: (idx: number, value: number) => void
  toggleCandidate: (idx: number, value: number) => void
  eraseCell: (idx: number) => void
  selectCell: (idx: number | null) => void
  togglePencil: () => void
  toggleAutoCandidate: () => void
  undo: () => void
  redo: () => void
  resetPuzzle: () => void
  fillCandidates: () => void
  clearAllCandidates: () => void
  startTimer: () => void
  pauseGame: () => void
  resumeGame: () => void
  tickSecond: () => void
  loadFromLocal: () => Promise<boolean>
  saveToLocal: () => Promise<void>
  clearLocal: () => Promise<void>
  reset: () => void
}

const INITIAL_BLANK: Pick<
  GameState,
  | 'puzzleId'
  | 'cells'
  | 'originalCells'
  | 'difficulty'
  | 'isCompleted'
  | 'selectedIdx'
  | 'usingPencil'
  | 'autoCandidateMode'
  | 'actions'
  | 'redoActions'
  | 'loading'
  | 'saveError'
  | 'elapsedSeconds'
  | 'status'
> = {
  puzzleId: null,
  cells: buildBlankCells(),
  originalCells: buildBlankCells(),
  difficulty: null,
  isCompleted: false,
  selectedIdx: null,
  usingPencil: false,
  autoCandidateMode: false,
  actions: [],
  redoActions: [],
  loading: false,
  saveError: null,
  elapsedSeconds: 0,
  status: 'not-started',
}

const LOCAL_STORAGE_KEY = 'mobile:gameState'

export const useGameStore = create<GameState>((set, get) => ({
  ...INITIAL_BLANK,

  async getNewPuzzle(difficulty) {
    set({ loading: true, saveError: null })
    const res = await sudokuService.getNewPuzzle(difficulty)
    if (!res.ok) {
      set({ loading: false })
      return { ok: false, message: res.message }
    }
    const cells = deserializeCells(res.body.cells, res.body.cells, res.body.candidates)
    set({
      puzzleId: res.body.puzzleId,
      cells,
      originalCells: cells.map((c) => ({ ...c })),  // deep-copy snapshot
      difficulty: res.body.difficulty,
      isCompleted: false,
      selectedIdx: null,
      usingPencil: false,
      actions: [],
      redoActions: [],
      elapsedSeconds: 0,
      status: 'playing',
      loading: false,
    })
    return { ok: true }
  },

  async getUserPuzzle(puzzleId) {
    set({ loading: true, saveError: null })
    const res = await sudokuService.getUserPuzzle(puzzleId)
    if (!res.ok) {
      set({ loading: false })
      return { ok: false, message: res.message }
    }
    const p = res.body
    const cells = deserializeCells(p.originalCells, p.currentCells, p.currentCandidates)
    const originalCells = deserializeCells(p.originalCells)
    set({
      puzzleId: p.puzzleId,
      cells,
      originalCells,
      difficulty: p.difficulty,
      isCompleted: p.isCompleted,
      selectedIdx: null,
      usingPencil: false,
      actions: (p.actions ?? []).map(deserializeAction),
      redoActions: [],
      elapsedSeconds: p.time ?? 0,
      status: p.isCompleted ? 'solved' : 'playing',
      loading: false,
    })
    return { ok: true }
  },

  async saveGameState() {
    const s = get()
    if (!s.puzzleId) return { ok: false, message: 'No puzzle to save' }
    // Saving requires auth (backend route is requireLoggedin).
    // Quietly no-op for anonymous users — they get to play but can't persist.
    if (!useUserStore.getState().id) return { ok: false, message: 'Not signed in' }

    const body = {
      cells: serializeCellsToString(s.cells),
      candidates: serializeCandidatesToString(s.cells),
      isCompleted: s.isCompleted,
      actions: s.actions.map(serializeAction),
      time: s.elapsedSeconds,
    }
    const res = await sudokuService.updateUserPuzzle(s.puzzleId, body)
    if (!res.ok) {
      set({ saveError: res.message })
      return { ok: false, message: res.message }
    }
    set({ saveError: null })
    return { ok: true }
  },

  setCell(idx, value) {
    const s = get()
    if (idx < 0 || idx >= 81) return
    if (s.originalCells[idx]?.value !== 0) return  // prefilled — locked

    const prev = s.cells[idx]
    if (!prev) return
    // No-op when setting to current value (avoids junking undo stack with no-ops).
    if (prev.value === value) return

    const newCells = s.cells.slice()
    const actions: Action[] = []

    // Parent action: capture the target cell's prior state. Clear candidates
    // on the target when placing a value (sudoku convention — cell with a
    // value has no candidates).
    actions.push({ prevCell: cloneCell(prev), isParent: true })
    newCells[idx] = { ...prev, value, candidates: value === 0 ? prev.candidates : [] }

    // Auto-candidate propagation. When the user places a value and the mode is
    // on, strip that value from every empty peer's candidate list. Each
    // affected peer becomes a child action so undo reverses the whole group.
    if (s.autoCandidateMode && value !== 0) {
      for (const peerIdx of peerIndicesOf(idx)) {
        const peer = newCells[peerIdx]
        if (peer.value !== 0) continue
        if (!peer.candidates.includes(value)) continue
        actions.push({ prevCell: cloneCell(peer), isParent: false })
        newCells[peerIdx] = {
          ...peer,
          candidates: peer.candidates.filter((c) => c !== value),
        }
      }
    }

    const solved = isSolved(newCells)
    set({
      cells: newCells,
      actions: s.actions.concat(actions),
      redoActions: [],
      isCompleted: solved,
      status: solved ? 'solved' : s.status,
    })
    if (solved) void get().saveGameState()
  },

  toggleCandidate(idx, value) {
    const s = get()
    if (idx < 0 || idx >= 81) return
    if (s.originalCells[idx]?.value !== 0) return
    if (value < 1 || value > 9) return

    const prev = s.cells[idx]
    if (!prev || prev.value !== 0) return  // can't pencil over a filled cell

    const isSet = prev.candidates.includes(value)
    const newCandidates = isSet
      ? prev.candidates.filter((c) => c !== value)
      : [...prev.candidates, value].sort((a, b) => a - b)

    const newCells = s.cells.slice()
    newCells[idx] = { ...prev, candidates: newCandidates }
    set({
      cells: newCells,
      actions: s.actions.concat([{ prevCell: cloneCell(prev), isParent: true }]),
      redoActions: [],
    })
  },

  eraseCell(idx) {
    const s = get()
    if (idx < 0 || idx >= 81) return
    if (s.originalCells[idx]?.value !== 0) return
    const prev = s.cells[idx]
    if (!prev) return
    if (prev.value === 0 && prev.candidates.length === 0) return  // already empty

    const newCells = s.cells.slice()
    newCells[idx] = { ...prev, value: 0, candidates: [] }
    set({
      cells: newCells,
      actions: s.actions.concat([{ prevCell: cloneCell(prev), isParent: true }]),
      redoActions: [],
      isCompleted: false,
      // If status was somehow 'solved' (e.g. we backed out of a solved state),
      // demote back to playing.
      status: s.status === 'solved' ? 'playing' : s.status,
    })
  },

  selectCell(idx) {
    set({ selectedIdx: idx })
  },

  togglePencil() {
    set({ usingPencil: !get().usingPencil })
  },

  toggleAutoCandidate() {
    set({ autoCandidateMode: !get().autoCandidateMode })
  },

  /**
   * Undo: pop actions from the end until we've popped a parent (inclusive),
   * applying each action's prevCell back to cells[]. The popped actions are
   * pushed onto redoActions with the cell's CURRENT state captured first, so
   * redo can step forward without recomputing.
   */
  undo() {
    const s = get()
    if (s.actions.length === 0) return
    const newCells = s.cells.slice()
    const newActions = s.actions.slice()
    const newRedo = s.redoActions.slice()

    // Pop child actions (if any), then the parent.
    while (newActions.length > 0) {
      const popped = newActions.pop()!
      const current = newCells[popped.prevCell.idx]
      newRedo.push({ prevCell: cloneCell(current), isParent: popped.isParent })
      newCells[popped.prevCell.idx] = cloneCell(popped.prevCell)
      if (popped.isParent) break
    }

    const solved = isSolved(newCells)
    set({
      cells: newCells,
      actions: newActions,
      redoActions: newRedo,
      isCompleted: solved,
      status: solved ? 'solved' : s.status === 'solved' ? 'playing' : s.status,
    })
  },

  redo() {
    const s = get()
    if (s.redoActions.length === 0) return
    const newCells = s.cells.slice()
    const newActions = s.actions.slice()
    const newRedo = s.redoActions.slice()

    // Reverse of undo: pop one parent then any non-parent children that follow.
    // Because the redo stack was built by popping (parent first, then children
    // in reverse order), we pop children off first and only then the parent —
    // matching the original push order.
    let didParent = false
    while (newRedo.length > 0) {
      const popped = newRedo[newRedo.length - 1]
      if (popped.isParent && didParent) break
      newRedo.pop()
      const current = newCells[popped.prevCell.idx]
      newActions.push({ prevCell: cloneCell(current), isParent: popped.isParent })
      newCells[popped.prevCell.idx] = cloneCell(popped.prevCell)
      if (popped.isParent) didParent = true
    }

    const solved = isSolved(newCells)
    set({
      cells: newCells,
      actions: newActions,
      redoActions: newRedo,
      isCompleted: solved,
      status: solved ? 'solved' : s.status === 'solved' ? 'playing' : s.status,
    })
  },

  resetPuzzle() {
    const s = get()
    set({
      cells: s.originalCells.map((c) => ({ ...c })),
      actions: [],
      redoActions: [],
      selectedIdx: null,
      isCompleted: false,
      status: s.status === 'solved' ? 'playing' : s.status,
    })
  },

  /** Fill empty cells with their full candidate sets (intersected with peer constraints). */
  fillCandidates() {
    set({ cells: computeCandidates(get().cells) })
  },

  clearAllCandidates() {
    set({ cells: clearAllCandidatesFn(get().cells) })
  },

  startTimer() {
    set({ status: 'playing' })
  },

  pauseGame() {
    if (get().status === 'playing') set({ status: 'paused' })
  },

  resumeGame() {
    if (get().status === 'paused') set({ status: 'playing' })
  },

  /**
   * Advance the timer by one second. Called by an interval owned by the game
   * screen (not the store) so React effects can mount/clean it up cleanly.
   * Triggers an opportunistic save every 10 ticks.
   */
  tickSecond() {
    const s = get()
    if (s.status !== 'playing') return
    const next = s.elapsedSeconds + 1
    set({ elapsedSeconds: next })
    if (next % 10 === 0) {
      void get().saveGameState()
    }
  },

  async loadFromLocal() {
    try {
      const raw = await AsyncStorage.getItem(LOCAL_STORAGE_KEY)
      if (!raw) return false
      const data = JSON.parse(raw) as Partial<GameState>
      if (!data.puzzleId || !Array.isArray(data.cells) || data.cells.length !== 81) return false
      set({
        ...INITIAL_BLANK,
        puzzleId: data.puzzleId,
        cells: data.cells,
        originalCells: Array.isArray(data.originalCells) && data.originalCells.length === 81
          ? data.originalCells
          : data.cells,
        difficulty: data.difficulty ?? null,
        isCompleted: !!data.isCompleted,
        autoCandidateMode: !!data.autoCandidateMode,
        usingPencil: !!data.usingPencil,
        actions: Array.isArray(data.actions) ? data.actions : [],
        redoActions: Array.isArray(data.redoActions) ? data.redoActions : [],
        elapsedSeconds: typeof data.elapsedSeconds === 'number' ? data.elapsedSeconds : 0,
        status: data.status === 'solved' || data.status === 'paused' ? data.status : 'playing',
      })
      return true
    } catch {
      return false
    }
  },

  async saveToLocal() {
    const s = get()
    if (!s.puzzleId) return
    const payload = {
      puzzleId: s.puzzleId,
      cells: s.cells,
      originalCells: s.originalCells,
      difficulty: s.difficulty,
      isCompleted: s.isCompleted,
      autoCandidateMode: s.autoCandidateMode,
      usingPencil: s.usingPencil,
      actions: s.actions,
      redoActions: s.redoActions,
      elapsedSeconds: s.elapsedSeconds,
      status: s.status,
    }
    try {
      await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // Best-effort.
    }
  },

  async clearLocal() {
    try {
      await AsyncStorage.removeItem(LOCAL_STORAGE_KEY)
    } catch {
      // Best-effort.
    }
  },

  reset() {
    set({ ...INITIAL_BLANK, cells: buildBlankCells(), originalCells: buildBlankCells() })
  },
}))

// ─── selectors ──────────────────────────────────────────────────────────────

export const selectIsPuzzleSolved = (s: GameState): boolean => s.isCompleted
export const selectTimerActive = (s: GameState): boolean => s.status === 'playing'
export const selectCanUndo = (s: GameState): boolean => s.actions.length > 0
export const selectCanRedo = (s: GameState): boolean => s.redoActions.length > 0
/** Cell-at-idx errored? Cheap enough to call per cell during render. */
export const selectCellHasError = (s: GameState, idx: number): boolean => cellHasError(s.cells, idx)
/** Could placing `value` at the selected cell violate constraints? */
export const selectNumberWorks = (s: GameState, value: number): boolean =>
  s.selectedIdx === null ? true : numberWorksInCell(s.cells, s.selectedIdx, value)

// ─── internals ──────────────────────────────────────────────────────────────

function cloneCell(c: Cell): Cell {
  return { idx: c.idx, value: c.value, candidates: c.candidates.slice() }
}

// HH:MM:SS formatter — useful for the pause menu and game-screen header.
export function formatElapsed(totalSeconds: number): string {
  const total = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`
  return `${m}:${pad(s)}`
}
