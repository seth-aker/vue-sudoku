import { SudokuPuzzle, type SudokuOptions } from "@/stores/models/puzzle";
import { config } from '@/config/index'
import type { SudokuStoreState } from "@/stores/models/sudokuStoreState";
import { useAuth0 } from "@auth0/auth0-vue";
const {API_BASE_URL} = config;
async function fetchNewPuzzle(options?: SudokuOptions) {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const fetchOptions: RequestInit = {
    method: "GET",
  }
  if(isAuthenticated.value) {
    const token = await getAccessTokenSilently();
    fetchOptions.headers = [['authorization', `Bearer ${token}`]]
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
  return stateString === null ? stateString : JSON.parse(stateString);
}
export default {fetchNewPuzzle, fetchPuzzle, updatePuzzle, saveGameStateLocally, retrieveLocalState}
