import { PuzzleArray } from "./models/puzzleArray";
import PuzzleOptions from "./models/puzzleOptions";
import { CreatePuzzle, SudokuPuzzle, SudokuPuzzleResponse, UpdatePuzzle } from "./models/sudokuPuzzle";

export interface SudokuDataSource {
    getPuzzle: (requestedBy: string, options: PuzzleOptions) => Promise<SudokuPuzzleResponse>;
    getPuzzleById: (requestedBy: string, puzzleId: string) => Promise<SudokuPuzzle>;
    getPuzzles: (options: PuzzleOptions, page?: number, limit?: number) => Promise<PuzzleArray>;
    createPuzzles: (puzzles: CreatePuzzle[]) => Promise<number>;
    updatePuzzle: (puzzle: UpdatePuzzle) => Promise<number>;
    deletePuzzle: (puzzleId: string) => Promise<number>;
}
