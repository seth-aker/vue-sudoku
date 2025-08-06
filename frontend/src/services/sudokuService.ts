import { SudokuPuzzle, type SudokuOptions } from "@/stores/models/puzzle";
import { buildBlankPuzzleRows, buildStandardPuzzleRows } from "@/utils/buildPuzzle";
import { config } from '@/config/index'
const {API_URL} = config;
async function fetchNewPuzzle(options?: SudokuOptions) {
  await fetch(`${API_URL}/sudoku?difficulty=${options?.difficulty}`)
}
async function fetchPuzzle(puzzleId: string) {
  await fetch(`${API_URL}/sudoku/${puzzleId}`)
}
async function updatePuzzle(puzzleId: string, puzzle: SudokuPuzzle) {
  await fetch(`${API_URL}/sudoku/${puzzleId}`, {
    body: JSON.stringify(puzzle)
  })
}

export default {fetchNewPuzzle}
