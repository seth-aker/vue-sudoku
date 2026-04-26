import { PuzzleArray } from "../datasource/models/puzzleArray";
import { type PuzzleOptions} from "../datasource/models/puzzleOptions";
import { SudokuPuzzle, CreatePuzzle, UpdatePuzzle } from "../datasource/models/sudokuPuzzle";

export interface SudokuService {
  getNewPuzzle: (requestedBy: string | undefined, options: PuzzleOptions) => Promise<SudokuPuzzle>;
  getPuzzles: (options: PuzzleOptions, page?: number, limit?: number) => Promise<PuzzleArray>;
  createPuzzles: (puzzles: CreatePuzzle[]) => Promise<number>;
  updateUserPuzzle: (userId: string, puzzle: UpdatePuzzle) => Promise<number>;
  deletePuzzle: (puzzleId: string) => Promise<number>;
}
