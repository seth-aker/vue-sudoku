import type { Action } from "./action";
import type { SudokuPuzzle } from "./puzzle";

export interface SudokuStoreState {
  puzzle: SudokuPuzzle,
  puzzleId: string,
  usingPencil: boolean,
  selectedCell: {
    x: number | undefined,
    y: number | undefined
  },
  actions: Action[],
  autoCandidateMode: boolean
}
