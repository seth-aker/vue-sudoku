import { SudokuPuzzle, type SudokuOptions } from "@/stores/models/puzzle";
import { config } from '@/config/index'
import type { SudokuStoreState } from "@/stores/models/sudokuStoreState";
import type { Difficulty } from "@/stores/models/difficulty";
import { buildBlankPuzzleRows } from "@/utils/buildPuzzle";
const {API_BASE_URL} = config;
export interface PuzzleDTO {
  _id: string,
  cells: string;
  candidates?: string
  difficulty: Difficulty
}
export interface UpdatePuzzleDto extends Omit<PuzzleDTO, 'difficulty'> {
  time: number
  isCompleted: boolean
} 
async function fetchNewPuzzle(options?: SudokuOptions) {
  const fetchOptions: RequestInit = {
    method: "GET",
    headers: {"Content-Type": "application/json"},
    credentials: 'include'
  }
  try {
    const response = await fetch(`${API_BASE_URL}/sudoku/new?difficulty=${options?.difficulty.rating || 'beginner'}`, fetchOptions)
    if(!response.ok) {
      const errData = await response.json();
      console.log(errData)
      throw new Error(errData.message || `API Error: ${response.status}`)
    }
    const puzzleDTO = await response.json() as PuzzleDTO
    const puzzle = deserializePuzzle(puzzleDTO)
    return {puzzle, _id: puzzleDTO._id}
  } catch (err) {
    console.log(err)
  }
}
async function fetchPuzzle(puzzleId: string) {
  return await fetch(`${API_BASE_URL}/sudoku/${puzzleId}`)
}
async function updatePuzzle(puzzleId: string, puzzle: SudokuPuzzle, elapsedTime: number, isCompleted: boolean) {
  const puzzleDto = serializePuzzle(puzzleId, puzzle);
  const updateDto: UpdatePuzzleDto = {
    _id: puzzleDto._id,
    cells: puzzleDto.cells,
    candidates: puzzleDto.candidates,
    time: elapsedTime,
    isCompleted
  }
  try {
    const res = await fetch(`${API_BASE_URL}/sudoku/${puzzleId}`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(updateDto),
      credentials: 'include'
    })
    if(!res.ok) {
      const error = await res.json()
      console.log(error)
      throw new Error(error.message || `API error: ${res.status}`)
    }
  } catch (err) {
    throw err
  }
}
function saveGameStateLocally(state: SudokuStoreState ) {
  const stateString = JSON.stringify(state);
  localStorage.setItem('localGameState', stateString);
}
function retrieveLocalState(): SudokuStoreState | null {
  const stateString = localStorage.getItem('localGameState');
  if(stateString === null) return null;
  const stateObj: SudokuStoreState = JSON.parse(stateString);
  stateObj.puzzle = SudokuPuzzle.fromJSON(stateObj.puzzle)
  return stateObj;
}
function deleteGameStateLocally() {
  localStorage.removeItem('localGameState')
}

function deserializePuzzle(puzzle: PuzzleDTO): SudokuPuzzle {
  const cells: number[] = puzzle.cells.split("").map(val => {
    const num = Number.parseInt(val)
    if(Number.isNaN(num)) {
      return -1;
    }
    return num;
  })
  const rows = buildBlankPuzzleRows();
  rows.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
      const index = rowIdx * 9 + colIdx
      const val: number = cells[index];
      cell.value = val !== 0 ? val : undefined;
      cell.type = val !== 0 ? 'prefilled' : 'blank'
    })
  })
  return new SudokuPuzzle(rows, { difficulty: puzzle.difficulty})
}
function serializePuzzle(id: string, puzzle: SudokuPuzzle) {
  let cellStr = '';
  let candidateStr = ''
  puzzle.rows.forEach((row) => {
    row.forEach((cell) => {
      cellStr += cell.value ?? '0'
      candidateStr += cell.candidates.join('') + ':'
    })
  })
  // remove the last :
  candidateStr = candidateStr.substring(0, candidateStr.length - 1);
  const dto: PuzzleDTO = {
    _id: id,
    cells: cellStr,
    candidates: candidateStr,
    difficulty: puzzle.options.difficulty
  }
  return dto
}

export default {fetchNewPuzzle, fetchPuzzle, updatePuzzle, saveGameStateLocally, retrieveLocalState, deleteGameStateLocally}
