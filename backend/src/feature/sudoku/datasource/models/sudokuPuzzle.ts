import { ObjectId } from "mongodb";
import { Difficulty } from "./difficulty.ts";
import { Row } from "./row.ts";

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
