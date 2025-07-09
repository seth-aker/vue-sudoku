import { Row } from "./row";

export interface SudokuPuzzle {
  puzzleId: string,
  cells: Row[];
  usedBy: string[]
}

export interface CreatePuzzle extends Omit<SudokuPuzzle, 'puzzleId'> {};

export interface UpdatePuzzle extends Partial<SudokuPuzzle> {};
