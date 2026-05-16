import { Action, Cell, Difficulty } from '@/src/domain';
import { STORAGE_KEYS, storage } from '@/src/lib/storage';

/**
 * Locally-persisted game snapshot (AsyncStorage). Replaces the web app's
 * synchronous localStorage. Conflicts/solved are derived on hydrate and never
 * stored; elapsed time is kept here too (one combined write — plan §7.4).
 */
export interface PersistedGameState {
  puzzleId?: string;
  cells: Cell[];
  originalCells: Cell[];
  difficulty?: Difficulty;
  selectedIdx?: number;
  usingPencil: boolean;
  autoCandidateMode: boolean;
  actions: Action[];
  redoActions: Action[];
  elapsedSeconds: number;
}

export const saveLocalGameState = (state: PersistedGameState): Promise<void> =>
  storage.setItem(STORAGE_KEYS.gameState, state);

export const loadLocalGameState = (): Promise<PersistedGameState | null> =>
  storage.getItem<PersistedGameState>(STORAGE_KEYS.gameState);

export const clearLocalGameState = (): Promise<void> =>
  storage.removeItem(STORAGE_KEYS.gameState);
