import { ObjectId } from "mongodb";
import { type Difficulty } from "./difficulty.ts";
import { type Row } from "./row.ts";

export interface SudokuPuzzle {
  _id: ObjectId,
  cells: Row[];
  difficulty: Difficulty,
}

export interface CreatePuzzle extends Omit<SudokuPuzzle, '_id'> {}

export interface UpdatePuzzle extends Partial<SudokuPuzzle> {}

export interface CurrentPuzzle extends SudokuPuzzle {
  solved: boolean
}
export interface SudokuPuzzleResponse {
  metadata: {
    totalCount: number
  },
  puzzle: SudokuPuzzle
}
