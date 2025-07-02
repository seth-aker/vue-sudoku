import type { Cell } from "@/stores/models/cell";
import type { Difficulty } from "@/stores/models/difficulty";
import type { Row } from "@/stores/models/row";
import { SudokuPuzzle } from "@/stores/models/puzzle";
const API_URL = 'http://localhost:3000/api'
async function fetchPuzzle(difficulty: Difficulty) {
  //  const res = await fetch(`${API_URL}/new?difficulty=${difficulty}`)

  // For development build a completed game
  const rows = [] as Row[]
  for(let i = 0; i < 9; i++) {
    const row = [] as Row
    for(let j = 0; j < 9; j++) {
      const cell: Cell = {
        type: 'original',
        value: ((i + j) % 10) + 1,
        pencilValues: []
      }
      row.push(cell)
    }
    rows.push(row)
  }
  return new SudokuPuzzle(rows, difficulty);
}

export default {fetchPuzzle}
