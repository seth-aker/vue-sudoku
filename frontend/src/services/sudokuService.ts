import { SudokuPuzzle, type SudokuOptions } from "@/stores/models/puzzle";
import { buildBlankPuzzleRows, buildStandardPuzzleRows } from "@/utils/buildPuzzle";
const API_URL = 'http://localhost:3000/api'
async function fetchPuzzle(options?: SudokuOptions) {
  //  const res = await fetch(`${API_URL}/new?difficulty=${difficulty}`)

  // For development build a completed game
  return new SudokuPuzzle(buildBlankPuzzleRows(), options)
}

export default {fetchPuzzle}
