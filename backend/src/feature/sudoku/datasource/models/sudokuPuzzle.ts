import { ObjectId } from "mongodb";
import { Difficulty } from "./difficulty.js";
import { Row } from "./row.js";

export interface SudokuPuzzle {
  _id: string | ObjectId,
  cells: Row[];
  difficulty: Difficulty
  usedBy: ObjectId[]
}

export interface CreatePuzzle extends Omit<SudokuPuzzle, '_id'> {}

export interface UpdatePuzzle extends Partial<SudokuPuzzle> {}

export interface SudokuPuzzleResponse {
  metadata: {
    totalCount: number
  },
  puzzle: SudokuPuzzle
}
