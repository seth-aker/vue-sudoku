import { ObjectId } from "mongodb";
import { PuzzleArray } from "../models/puzzleArray";
import PuzzleOptions from "../models/puzzleOptions";
import { SudokuPuzzle, CreatePuzzle, UpdatePuzzle } from "../models/sudokuPuzzle";

export interface SudokuService {
  getPuzzle: (requestedBy: string, options: PuzzleOptions) => Promise<SudokuPuzzle>;
  getPuzzleById: (requestedBy: string, puzzleId: string) => Promise<SudokuPuzzle>;
  getPuzzles: (page?: number, limit?: number) => Promise<PuzzleArray>;
  createPuzzle: (puzzle: CreatePuzzle) => Promise<SudokuPuzzle>;
  updatePuzzle: (puzzle: UpdatePuzzle) => Promise<number>;
  deletePuzzle: (puzzleId: string | ObjectId) => Promise<number>;
}