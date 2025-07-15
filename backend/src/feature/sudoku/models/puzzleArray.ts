import { SudokuPuzzle } from "./sudokuPuzzle"

export interface PuzzleArray {
    metadata: { 
        totalCount: number, 
        page: number, 
        limit: number
    },
    puzzles: SudokuPuzzle[]
}