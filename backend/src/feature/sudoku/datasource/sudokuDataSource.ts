import { type PuzzleArray } from "./models/puzzleArray.ts";
import { type PuzzleOptions} from "./models/puzzleOptions.ts";
import { SqlPuzzle, type CreatePuzzle, type SudokuPuzzleResponse, type UpdatePuzzle } from "./models/sudokuPuzzle.ts";

export interface SudokuDataSource {
    getNewPuzzle: (requestedBy: string | undefined, options: PuzzleOptions) => Promise<SudokuPuzzleResponse>;
    getPuzzleById: (puzzleId: string) => Promise<SqlPuzzle>;
    getPuzzles: (options: PuzzleOptions, page?: number, limit?: number) => Promise<PuzzleArray>;
    createPuzzles: (puzzles: CreatePuzzle[]) => Promise<number>;
    updateUserPuzzle: (userId: string, puzzle: UpdatePuzzle) => Promise<number>;
    deletePuzzle: (puzzleId: string) => Promise<number>;
}
