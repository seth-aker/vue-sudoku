import { defineStore } from "pinia";
import { SudokuPuzzle, type SudokuOptions } from "./models/puzzle";
import sudokuService from "@/services/sudokuService";
import { buildBlankPuzzleRows } from "@/utils/buildPuzzle";
import type { Action } from "@/stores/models/action.d.ts";
import type { Cell } from "./models/cell";
import lodash from 'lodash'
import { cellHasError } from "@/utils/cellHasError";
import { numberWorksInCell } from "@/utils/numberWorksInCell";
import { calcBlockNum } from "@/utils/calcBlockNumber";
import { computed, ref } from "vue";
import type { SudokuStoreState } from "./models/sudokuStoreState";
import { useGameStore } from "./gameStore";
const blankPuzzle = new SudokuPuzzle(buildBlankPuzzleRows())
export const useSudokuStore = defineStore('sudoku', () => {
  const gameStore = useGameStore()

  const puzzleId = ref<string | undefined>(undefined)
  const puzzle = ref<SudokuPuzzle>(blankPuzzle);
  const usingPencil = ref(false)
  const selectedCell = ref({
    x: undefined as number | undefined,
    y: undefined as number | undefined,
  })
  const actions = ref<Action[]>([])
  const autoCandidateMode = ref(false)
  
  function retrieveLocalState() {
    const state = sudokuService.retrieveLocalState();
    if(state !== null) {
      $patch(state)
      return true;
    }
    return false
  }
  function saveGameStateLocal() {
    const state = {
      puzzleId: puzzleId.value,
      puzzle: puzzle.value,
      usingPencil: usingPencil.value,
      selectedCell: selectedCell.value,
      actions: actions.value,
      autoCandidateMode: autoCandidateMode.value
    }
    sudokuService.saveGameStateLocally(state)
  }
  function deleteGameStateLocal() {
    sudokuService.deleteGameStateLocally();
  }
  async function getNewPuzzle(options: SudokuOptions) {
    const response = await sudokuService.fetchNewPuzzle(options);
    
    if(response) {
      $patch({
        puzzleId: response._id,
        puzzle: response.puzzle,
        selectedCell: {
          x: undefined,
          y: undefined
        },
        actions: []
      })
      saveGameStateLocal();
    }
  }
  async function saveGameState() {
    if(!puzzleId.value) {
      return
    }
    await sudokuService.updatePuzzle(puzzleId.value, puzzle.value, gameStore.elapsedSeconds, isPuzzleSolved.value)
  }
  function setCell(cell: Cell, x: number, y: number) {
    const prevCell = puzzle.value.getCell(x, y);
    actions.value.push({prevCell, x, y})
    puzzle.value.setCell(cell, x, y);
    if(autoCandidateMode.value && !prevCell?.value && cell.value) {
      const row = puzzle.value.rows[y];
      const col = puzzle.value.getColumn(x)!;
      const blockNumber = calcBlockNum(y,x, puzzle.value.rows)
      const block = puzzle.value.getBlock(blockNumber)!
      const value = cell.value;
      for(const [index, cell] of row.entries()) {
        if(cell.candidates.includes(value)) {
          actions.value.push({
            prevCell: cell, 
            x: index,
            y
          })
          cell.candidates = cell.candidates.filter((candidate) => candidate !== value);
        }
      }
      for(const [idx, cell] of col.entries()) {
        if(cell.candidates.includes(value)) {
          actions.value.push({
            prevCell: cell,
            x,
            y: idx
          })
          cell.candidates = cell.candidates.filter((candidate) => candidate !== value);
        }
      }
      for(const [idx, cell] of block.entries()) {
        if(cell.candidates.includes(value)) {
          const xOffset = (blockNumber % 3) * 3 
          const yOffset = (Math.floor(blockNumber / 3) * 3)
          actions.value.push({
            prevCell: cell,
            x: (xOffset + idx % 3),
            y: (yOffset + (Math.floor(idx / 3)))
          })
          cell.candidates = cell.candidates.filter((candidate) => candidate !== value);
        }
      }
    }
    saveGameStateLocal();
  }
  function getCell(x:number | undefined, y: number | undefined) {
    const cell = puzzle.value.getCell(x,y)
    return lodash.cloneDeep(cell);
  }
  function undoAction() {
    const action = actions.value.pop();
    if(action === undefined || action.prevCell === undefined) {
      return;
    }
    puzzle.value.setCell(action.prevCell, action.x, action.y)
    selectedCell.value = { x: action.x, y: action.y}
    saveGameStateLocal()
  }
  function resetPuzzle() {
    puzzle.value.rows = puzzle.value.originalPuzzle;
    actions.value = []
    selectedCell.value = {x: undefined, y: undefined}
    saveGameStateLocal();
  }
  function fillPuzzleCandidates() {
    for(let candidate = 1; candidate <= puzzle.value.cellsPerRow; candidate++) {
      for(let rowIndex = 0; rowIndex < puzzle.value.rows.length; rowIndex++) {
        for(let colIndex = 0; colIndex < puzzle.value.rows.length; colIndex++) {
          const cell = puzzle.value.rows[rowIndex][colIndex];
          if(cell.value) {
            continue;
          }
          if(numberWorksInCell(rowIndex, colIndex, candidate, puzzle.value) && !cell.candidates.includes(candidate)) {
            cell.candidates.push(candidate);
          }
        }
      }
    }
  }
  function clearPuzzleCandidates() {
    for(const row of puzzle.value.rows) {
      for(const cell of row) {
        cell.candidates = []
      }
    }
  }
  function $patch(state: Partial<SudokuStoreState>) {
    if(state.puzzleId) puzzleId.value = state.puzzleId
    if(state.puzzle) puzzle.value = state.puzzle
    if(state.usingPencil !== undefined) usingPencil.value = state.usingPencil 
    if(state.autoCandidateMode !== undefined) autoCandidateMode.value = state.autoCandidateMode
    if(state.actions) actions.value = state.actions
    if(state.selectedCell) selectedCell.value = state.selectedCell
  }

  function $reset() {
    puzzleId.value = undefined,
    puzzle.value = new SudokuPuzzle(buildBlankPuzzleRows())
    actions.value = []
    selectedCell.value = {x: undefined, y: undefined}
    usingPencil.value = false,
    autoCandidateMode.value = false
  }
  const loading = computed(() => {
    return puzzleId.value === undefined
  })
  const isPuzzleSolved = computed(() => {
    if(puzzle.value.rows.some((row) => row.some((cell) => cell.value === undefined))) {
      return false;
    }
    let hasError = false;
    for(let rowIndex = 0; rowIndex < puzzle.value.cellsPerRow; rowIndex++) {
      for(let columnIndex = 0; columnIndex < puzzle.value.cellsPerRow; columnIndex++) {
        hasError = cellHasError(puzzle.value, columnIndex, rowIndex)
        if(hasError) {
          console.log(`Error found at x:${columnIndex}, y:${rowIndex}`)
          return false
        }
      }
    }
    return true;
  })
  return {
    puzzleId, 
    puzzle, 
    actions, 
    selectedCell, 
    usingPencil, 
    autoCandidateMode, 
    retrieveLocalState, 
    saveGameState, 
    saveGameStateLocal, 
    deleteGameStateLocal, 
    getNewPuzzle, 
    setCell, 
    getCell, 
    undoAction, 
    resetPuzzle, 
    fillPuzzleCandidates, 
    clearPuzzleCandidates, 
    $patch, 
    $reset, 
    loading, 
    isPuzzleSolved 
  }
})
