import { ObjectId } from "mongodb";
import { SudokuDataSource } from "../datasource/sudokuDataSource";
import { PuzzleArray } from "../models/puzzleArray";
import PuzzleOptions from "../models/puzzleOptions";
import { SudokuPuzzle, CreatePuzzle, UpdatePuzzle } from "../models/sudokuPuzzle";
import { SudokuService } from "./sudokuService";

export class SudokuServiceImplementation implements SudokuService {
  private sudokuDataSource: SudokuDataSource;
  private constructor(dataSource: SudokuDataSource) {
    this.sudokuDataSource = dataSource;
  }
  static instance: SudokuService | null = null;
  static create(dataSource: SudokuDataSource) {
    if(SudokuServiceImplementation.instance === null) {
      SudokuServiceImplementation.instance = new SudokuServiceImplementation(dataSource);
    }
    return SudokuServiceImplementation.instance
  }

  getPuzzle: (requestedBy: string, options: PuzzleOptions) => Promise<SudokuPuzzle>;
  async getPuzzleById(requestedBy: string, puzzleId: string): Promise<SudokuPuzzle> {
    // May want to transform the return below to a DTO but for now this is fine.
    return await this.sudokuDataSource.getPuzzleById(requestedBy, puzzleId);
  }
  getPuzzles: (page?: number, limit?: number) => Promise<PuzzleArray>;
  createPuzzle: (puzzle: CreatePuzzle) => Promise<SudokuPuzzle>;
  updatePuzzle: (puzzle: UpdatePuzzle) => Promise<number>;
  deletePuzzle: (puzzleId: string | ObjectId) => Promise<number>;

}
