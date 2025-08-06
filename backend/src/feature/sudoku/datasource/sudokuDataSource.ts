import { type PuzzleArray } from "./models/puzzleArray.ts";
import { type PuzzleOptions} from "./models/puzzleOptions.ts";
import { type CreatePuzzle, type SudokuPuzzle, type SudokuPuzzleResponse, type UpdatePuzzle } from "./models/sudokuPuzzle.ts";

export interface SudokuDataSource {
    getNewPuzzle: (requestedBy: string, options: PuzzleOptions) => Promise<SudokuPuzzleResponse>;
    getPuzzleById: (requestedBy: string, puzzleId: string) => Promise<SudokuPuzzle>;
    getPuzzles: (options: PuzzleOptions, page?: number, limit?: number) => Promise<PuzzleArray>;
    createPuzzles: (puzzles: CreatePuzzle[]) => Promise<number>;
    updatePuzzle: (puzzle: UpdatePuzzle) => Promise<number>;
    deletePuzzle: (puzzleId: string) => Promise<number>;
}
