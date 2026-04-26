// import { ObjectId } from "mongodb";
import { DifficultyRating, type Difficulty } from "./difficulty.ts";

export interface SudokuPuzzle {
  _id: string,
  cells: string;
  candidates?: string
  difficulty: Difficulty,
}

export interface CreatePuzzle extends Omit<SudokuPuzzle, '_id'> {
  solvedCells: string;
}

export interface UpdatePuzzle {
  _id: string,
  cells: string,
  candidates: string,
  time: number
  isCompleted: boolean
}

export interface SudokuPuzzleResponse {
  metadata: {
    totalCount: number
  },
  puzzle: SudokuPuzzle
}

export interface SqlPuzzle {
  puzzle_id: string,
  cells: string,
  difficulty_rating: DifficultyRating,
  difficulty_score: number,
  solved_cells: string,
}
export interface SqlUserPuzzle {
  puzzle_id: string,
  isCompleted: number,
  current_cells: string,
  current_candidates: string,
  time: string,
  original_cells: string,
  difficulty_rating: string,
  difficulty_score: string
}
