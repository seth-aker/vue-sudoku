import { ObjectId } from "mongodb";
import { Difficulty } from "./difficulty";
import { Row } from "./row";

export interface SudokuPuzzle {
  _id: ObjectId,
  cells: Row[];
  difficulty: Difficulty
}

export interface CreatePuzzle extends Omit<SudokuPuzzle, '_id'> {}

export interface UpdatePuzzle extends Partial<SudokuPuzzle> {}

export interface SudokuPuzzleResponse {
  metadata: {
    totalCount: number
  },
  puzzle: SudokuPuzzle
}
