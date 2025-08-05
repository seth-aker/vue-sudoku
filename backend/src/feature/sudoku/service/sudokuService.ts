import { PuzzleArray } from "../datasource/models/puzzleArray";
import PuzzleOptions from "../datasource/models/puzzleOptions";
import { SudokuPuzzle, CreatePuzzle, UpdatePuzzle } from "../datasource/models/sudokuPuzzle";

export interface SudokuService {
  getPuzzle: (requestedBy: string, options: PuzzleOptions) => Promise<SudokuPuzzle>;
  getPuzzleById: (requestedBy: string, puzzleId: string) => Promise<SudokuPuzzle>;
  getPuzzles: (options: PuzzleOptions, page?: number, limit?: number) => Promise<PuzzleArray>;
  createPuzzles: (puzzles: CreatePuzzle[]) => Promise<number>;
  updatePuzzle: (puzzle: UpdatePuzzle) => Promise<number>;
  deletePuzzle: (puzzleId: string) => Promise<number>;
}
