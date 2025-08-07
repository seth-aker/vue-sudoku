import { ObjectId } from "mongodb";
import { type Difficulty } from "./difficulty.ts";
import { type Row, rowSchema } from "./row.ts";
import mongoose from "mongoose";

export interface SudokuPuzzle {
  _id: ObjectId,
  cells: Row[];
  difficulty: Difficulty,
}

// export const sudokuPuzzleSchema = new mongoose.Schema<SudokuPuzzle>({
//   cells: [rowSchema],
//   difficulty: {
//     rating: {
//       type: String,
//       enum: ['easy', 'medium', 'hard', 'impossible']
//     },
//     score: Number
//   }
// })
// export const SudokuPuzzleModel = mongoose.model('puzzle', sudokuPuzzleSchema);

export interface CreatePuzzle extends Omit<SudokuPuzzle, '_id'> {}

export interface UpdatePuzzle extends Partial<SudokuPuzzle> {}

export interface SudokuPuzzleResponse {
  metadata: {
    totalCount: number
  },
  puzzle: SudokuPuzzle
}
