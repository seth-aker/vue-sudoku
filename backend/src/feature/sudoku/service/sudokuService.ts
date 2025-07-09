import PuzzleOptions from "../models/puzzleOptions";
import { SudokuPuzzle, CreatePuzzle, UpdatePuzzle } from "../models/sudokuPuzzle";

export interface SudokuService {
  getPuzzle: (requestedBy: string, options: PuzzleOptions) => Promise<SudokuPuzzle>;
  getPuzzleById: (requestedBy: string, puzzleId: string) => Promise<SudokuPuzzle>;
  getPuzzles: () => Promise<SudokuPuzzle[]>;
  savePuzzle: (puzzle: CreatePuzzle) => Promise<SudokuPuzzle>;
  updatePuzzle: (puzzle: UpdatePuzzle) => Promise<SudokuPuzzle>;
  deletePuzzle: (puzzleId: string) => Promise<SudokuPuzzle>;
}
