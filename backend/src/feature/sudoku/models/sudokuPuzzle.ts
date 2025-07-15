import { ObjectId } from "mongodb";
import { Difficulty } from "./difficulty";
import { Row } from "./row";

export interface SudokuPuzzle {
  _id: string | ObjectId,
  cells: Row[];
  difficulty: Difficulty
  usedBy: string[] | ObjectId[]
}

export interface CreatePuzzle extends Omit<SudokuPuzzle, '_id'> {}

export interface UpdatePuzzle extends Partial<SudokuPuzzle> {}
