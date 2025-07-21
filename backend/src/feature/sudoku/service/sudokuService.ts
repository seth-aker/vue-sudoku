import { PuzzleArray } from "../datasource/models/puzzleArray.ts";
import PuzzleOptions from "../datasource/models/puzzleOptions.ts";
import { SudokuPuzzle, CreatePuzzle, UpdatePuzzle } from "../datasource/models/sudokuPuzzle.ts";

export interface SudokuService {
  getPuzzle: (requestedBy: string, options: PuzzleOptions) => Promise<SudokuPuzzle>;
  getPuzzleById: (requestedBy: string, puzzleId: string) => Promise<SudokuPuzzle>;
  getPuzzles: (options: PuzzleOptions, page?: number, limit?: number) => Promise<PuzzleArray>;
  createPuzzle: (puzzle: CreatePuzzle) => Promise<SudokuPuzzle>;
  updatePuzzle: (puzzle: UpdatePuzzle) => Promise<number>;
  deletePuzzle: (puzzleId: string) => Promise<number>;
}
