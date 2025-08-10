import { SudokuPuzzle, type SudokuOptions } from "@/stores/models/puzzle";
import { config } from '@/config/index'
import type { SudokuStoreState } from "@/stores/models/sudokuStoreState";
const {API_BASE_URL} = config;
async function fetchNewPuzzle(options?: SudokuOptions, token?: string) {
  const fetchOptions: RequestInit = {
    method: "GET",
    headers: {"Content-Type": "application/json"}
  }
  if(token) {
    fetchOptions.headers = {
      "Content-Type": "application/json",
      "authorization": `Bearer ${token}`
    }
  }
  try {
    const response = await fetch(`${API_BASE_URL}/api/sudoku/new?difficulty=${options?.difficulty}`, fetchOptions)
    if(!response.ok) {
      const errData = await response.json();
      console.log(errData)
      throw new Error(errData.message || `API Error: ${response.status}`)
    }
    return await response.json()
  } catch (err) {
    console.log(err)
  }
}
async function fetchPuzzle(puzzleId: string) {
  return await fetch(`${API_BASE_URL}/api/sudoku/${puzzleId}`)
}
async function updatePuzzle(puzzleId: string, puzzle: SudokuPuzzle) {
  return await fetch(`${API_BASE_URL}/api/sudoku/${puzzleId}`, {
    body: JSON.stringify(puzzle)
  })
}
function saveGameStateLocally(state: SudokuStoreState ) {
  const stateString = JSON.stringify(state);
  localStorage.setItem('localState', stateString);
}
function retrieveLocalState(): SudokuStoreState | null {
  const stateString = localStorage.getItem('localState');
  if(stateString === null) return null;
  const stateObj: SudokuStoreState = JSON.parse(stateString);
  stateObj.puzzle = SudokuPuzzle.fromJSON(stateObj.puzzle)
  return stateObj;
}
export default {fetchNewPuzzle, fetchPuzzle, updatePuzzle, saveGameStateLocally, retrieveLocalState}
