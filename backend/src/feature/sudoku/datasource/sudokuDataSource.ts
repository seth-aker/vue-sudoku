import { PuzzleArray } from "./models/puzzleArray.ts";
import PuzzleOptions from "./models/puzzleOptions.ts";
import { CreatePuzzle, SudokuPuzzle, SudokuPuzzleResponse, UpdatePuzzle } from "./models/sudokuPuzzle.ts";

export interface SudokuDataSource {
    getPuzzle: (requestedBy: string, options: PuzzleOptions) => Promise<SudokuPuzzleResponse>;
    getPuzzleById: (requestedBy: string, puzzleId: string) => Promise<SudokuPuzzle>;
    getPuzzles: (options: PuzzleOptions, page?: number, limit?: number) => Promise<PuzzleArray>;
    createPuzzle: (puzzle: CreatePuzzle) => Promise<SudokuPuzzle>;
    updatePuzzle: (puzzle: UpdatePuzzle) => Promise<number>;
    deletePuzzle: (puzzleId: string) => Promise<number>;
}
