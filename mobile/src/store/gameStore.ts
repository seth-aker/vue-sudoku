import { create } from 'zustand';

import {
  Action,
  Cell,
  Difficulty,
  DifficultyRating,
  EMPTY,
  GameState,
  MutationResult,
  applyPencil,
  applyValue,
  clearCandidates,
  createBlankCells,
  eraseCell,
  fillCandidates,
  getConflicts,
  redo as redoLogic,
  resetPuzzle as resetLogic,
  undo as undoLogic,
} from '@/src/domain';
import { ServiceResult } from '@/src/services/http';
import {
  clearLocalGameState,
  loadLocalGameState,
  saveLocalGameState,
} from '@/src/services/localGameState';
import {
  fetchNewPuzzle,
  fetchPuzzle,
  updatePuzzle,
} from '@/src/services/sudokuService';

const ONE_MINUTE = 60;
const ONE_HOUR = 60 * ONE_MINUTE;

/** h:mm:ss / m:ss formatting (web parity). */
export function formatElapsed(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / ONE_HOUR);
  const mins = Math.floor((totalSeconds % ONE_HOUR) / ONE_MINUTE);
  const secs = (totalSeconds % ONE_HOUR) % ONE_MINUTE;
  let out = '';
  if (hours > 0) out += `${hours}:`;
  out += hours > 0 && mins < 10 ? `0${mins}:` : `${mins}:`;
  out += secs < 10 ? `0${secs}` : `${secs}`;
  return out;
}

// Module-scoped timers (kept out of React state).
let timerInterval: ReturnType<typeof setInterval> | null = null;
let timerStartedAt = 0;
let persistTimeout: ReturnType<typeof setTimeout> | null = null;
// Set when the app is backgrounded while the timer was running, so we can
// auto-resume on return without counting the backgrounded time.
let wasPlayingBeforeBackground = false;

interface GameStore {
  // Puzzle
  puzzleId?: string;
  cells: Cell[];
  originalCells: Cell[];
  difficulty?: Difficulty;
  selectedIdx?: number;
  usingPencil: boolean;
  autoCandidateMode: boolean;
  actions: Action[];
  redoActions: Action[];
  conflicts: Set<number>;
  isSolved: boolean;
  loading: boolean;

  // Timer / lifecycle
  elapsedSeconds: number;
  gameState: GameState;
  /** Server autosave is gated on auth (set by the user store). */
  autosaveEnabled: boolean;

  // Puzzle lifecycle
  newPuzzle: (d: DifficultyRating) => Promise<ServiceResult<unknown>>;
  loadUserPuzzle: (puzzleId: string) => Promise<ServiceResult<unknown>>;
  saveGameState: (opts?: { keepalive?: boolean }) => Promise<ServiceResult<unknown>>;
  hydrateFromLocal: () => Promise<boolean>;
  clearLocal: () => Promise<void>;
  resetAll: () => void;

  // Single consolidated save path (plan §7.9): immediate local write +
  // auth-gated server save. Used by the 10s tick, app background, and unmount.
  persistNow: () => Promise<void>;
  flush: () => Promise<void>;
  appBackground: () => void;
  appForeground: () => void;

  // Input
  selectCell: (idx: number) => void;
  inputNumber: (value: number) => void;
  eraseSelected: () => void;
  undo: () => void;
  redo: () => void;
  resetPuzzle: () => void;
  togglePencil: () => void;
  toggleAutoCandidate: () => void;

  // Timer
  startTimer: () => void;
  pauseTimer: () => void;
  toggleTimer: () => void;
  setAutosaveEnabled: (v: boolean) => void;
}

const blank = createBlankCells();

export const useGameStore = create<GameStore>((set, get) => {
  const snapshot = () => {
    const s = get();
    return {
      puzzleId: s.puzzleId,
      cells: s.cells,
      originalCells: s.originalCells,
      difficulty: s.difficulty,
      selectedIdx: s.selectedIdx,
      usingPencil: s.usingPencil,
      autoCandidateMode: s.autoCandidateMode,
      actions: s.actions,
      redoActions: s.redoActions,
      elapsedSeconds: s.elapsedSeconds,
    };
  };

  /** Schedule a debounced local persist (plan §7.3). */
  const persistLocalDebounced = () => {
    if (persistTimeout) clearTimeout(persistTimeout);
    persistTimeout = setTimeout(() => {
      void saveLocalGameState(snapshot());
    }, 400);
  };

  /** Immediate local write (cancels any pending debounce). */
  const persistNow = async () => {
    if (persistTimeout) {
      clearTimeout(persistTimeout);
      persistTimeout = null;
    }
    await saveLocalGameState(snapshot());
  };

  const recomputeDerived = (cells: Cell[]) => {
    const conflicts = getConflicts(cells);
    const allFilled = cells.every((c) => c.value !== EMPTY);
    const isSolved = allFilled && conflicts.size === 0;
    set({ conflicts, isSolved });
    if (isSolved) {
      pause();
      set({ gameState: 'solved' });
      void get().saveGameState();
    }
  };

  const applyMutation = (r: MutationResult) => {
    set({
      cells: r.cells,
      actions: r.actions,
      redoActions: r.redoActions,
      ...(r.selectedIdx !== undefined ? { selectedIdx: r.selectedIdx } : {}),
    });
    recomputeDerived(r.cells);
    persistLocalDebounced();
  };

  const pause = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  };

  const start = () => {
    pause();
    timerStartedAt = Date.now() - get().elapsedSeconds * 1000;
    set({ gameState: 'playing' });
    timerInterval = setInterval(() => {
      const secs = Math.floor((Date.now() - timerStartedAt) / 1000);
      set({ elapsedSeconds: secs });
      if (secs > 0 && secs % 10 === 0) {
        if (get().autosaveEnabled) void get().saveGameState();
        persistLocalDebounced();
      }
    }, 1000);
  };

  return {
    puzzleId: undefined,
    cells: blank,
    originalCells: blank,
    difficulty: undefined,
    selectedIdx: undefined,
    usingPencil: false,
    autoCandidateMode: false,
    actions: [],
    redoActions: [],
    conflicts: new Set<number>(),
    isSolved: false,
    loading: false,
    elapsedSeconds: 0,
    gameState: 'not-started',
    autosaveEnabled: false,

    newPuzzle: async (d) => {
      set({ loading: true });
      const res = await fetchNewPuzzle(d);
      if (res.success && res.body) {
        const p = res.body;
        set({
          puzzleId: p.puzzleId,
          cells: p.cells,
          originalCells: p.originalCells,
          difficulty: p.difficulty,
          actions: [],
          redoActions: [],
          selectedIdx: undefined,
          usingPencil: false,
          autoCandidateMode: false,
          elapsedSeconds: 0,
        });
        recomputeDerived(p.cells);
        start();
        persistLocalDebounced();
      }
      set({ loading: false });
      return res;
    },

    loadUserPuzzle: async (puzzleId) => {
      set({ loading: true });
      const res = await fetchPuzzle(puzzleId);
      if (res.success && res.body) {
        const p = res.body;
        set({
          puzzleId: p.puzzleId,
          cells: p.cells,
          originalCells: p.originalCells,
          difficulty: p.difficulty,
          actions: p.actions,
          redoActions: [],
          selectedIdx: undefined,
          elapsedSeconds: p.time,
        });
        recomputeDerived(p.cells);
        start();
        persistLocalDebounced();
      }
      set({ loading: false });
      return res;
    },

    saveGameState: async () => {
      const s = get();
      if (!s.puzzleId) return { success: false, message: 'No puzzle to save' };
      return updatePuzzle({
        puzzleId: s.puzzleId,
        cells: s.cells,
        actions: s.actions,
        time: s.elapsedSeconds,
        isCompleted: s.isSolved,
      });
    },

    hydrateFromLocal: async () => {
      const saved = await loadLocalGameState();
      if (!saved) return false;
      set({
        puzzleId: saved.puzzleId,
        cells: saved.cells,
        originalCells: saved.originalCells,
        difficulty: saved.difficulty,
        selectedIdx: saved.selectedIdx,
        usingPencil: saved.usingPencil,
        autoCandidateMode: saved.autoCandidateMode,
        actions: saved.actions,
        redoActions: saved.redoActions,
        elapsedSeconds: saved.elapsedSeconds,
        gameState: 'paused',
      });
      const conflicts = getConflicts(saved.cells);
      set({
        conflicts,
        isSolved:
          saved.cells.every((c) => c.value !== EMPTY) && conflicts.size === 0,
      });
      return true;
    },

    clearLocal: async () => {
      await clearLocalGameState();
    },

    resetAll: () => {
      pause();
      set({
        puzzleId: undefined,
        cells: createBlankCells(),
        originalCells: createBlankCells(),
        difficulty: undefined,
        selectedIdx: undefined,
        usingPencil: false,
        autoCandidateMode: false,
        actions: [],
        redoActions: [],
        conflicts: new Set<number>(),
        isSolved: false,
        elapsedSeconds: 0,
        gameState: 'not-started',
      });
    },

    selectCell: (idx) => set({ selectedIdx: idx }),

    inputNumber: (value) => {
      const s = get();
      if (s.selectedIdx === undefined) return;
      const slice = {
        cells: s.cells,
        originalCells: s.originalCells,
        actions: s.actions,
        redoActions: s.redoActions,
      };
      applyMutation(
        s.usingPencil
          ? applyPencil(slice, s.selectedIdx, value)
          : applyValue(slice, s.selectedIdx, value),
      );
    },

    eraseSelected: () => {
      const s = get();
      if (s.selectedIdx === undefined) return;
      applyMutation(
        eraseCell(
          {
            cells: s.cells,
            originalCells: s.originalCells,
            actions: s.actions,
            redoActions: s.redoActions,
          },
          s.selectedIdx,
        ),
      );
    },

    undo: () => {
      const s = get();
      applyMutation(
        undoLogic({
          cells: s.cells,
          originalCells: s.originalCells,
          actions: s.actions,
          redoActions: s.redoActions,
        }),
      );
    },

    redo: () => {
      const s = get();
      applyMutation(
        redoLogic({
          cells: s.cells,
          originalCells: s.originalCells,
          actions: s.actions,
          redoActions: s.redoActions,
        }),
      );
    },

    resetPuzzle: () => {
      const s = get();
      applyMutation(
        resetLogic({
          cells: s.cells,
          originalCells: s.originalCells,
          actions: s.actions,
          redoActions: s.redoActions,
        }),
      );
      set({ selectedIdx: undefined });
    },

    togglePencil: () => set((s) => ({ usingPencil: !s.usingPencil })),

    toggleAutoCandidate: () => {
      const next = !get().autoCandidateMode;
      set({ autoCandidateMode: next });
      const cells = next
        ? fillCandidates(get().cells)
        : clearCandidates(get().cells);
      set({ cells });
      recomputeDerived(cells);
      persistLocalDebounced();
    },

    startTimer: () => start(),
    pauseTimer: () => {
      pause();
      set({ gameState: 'paused' });
    },
    toggleTimer: () => {
      if (get().gameState === 'playing') {
        pause();
        set({ gameState: 'paused' });
      } else {
        start();
      }
    },
    setAutosaveEnabled: (v) => set({ autosaveEnabled: v }),

    persistNow: () => persistNow(),

    flush: async () => {
      await persistNow();
      const s = get();
      if (s.autosaveEnabled && s.puzzleId) {
        await s.saveGameState();
      }
    },

    appBackground: () => {
      // Freeze the timer (don't count backgrounded time) and hard-save.
      wasPlayingBeforeBackground = get().gameState === 'playing';
      if (wasPlayingBeforeBackground) pause();
      void get().flush();
    },

    appForeground: () => {
      if (wasPlayingBeforeBackground) {
        wasPlayingBeforeBackground = false;
        // start() recomputes from elapsedSeconds, excluding background time.
        start();
      }
    },
  };
});
