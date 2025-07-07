import { defineStore } from "pinia";
import type { Row } from "./models/row";
import { SudokuPuzzle, type SudokuOptions } from "./models/puzzle";
import sudokuService from "@/services/sudokuService";
import { buildBlankPuzzleRows } from "@/utils/buildPuzzle";
import type { Action } from "@/stores/models/action.d.ts";
import type { Cell } from "./models/cell";
import lodash from 'lodash'
import { cellHasError } from "@/utils/cellHasError";
export type Rows = Map<number, Row>
const blankPuzzle = new SudokuPuzzle(buildBlankPuzzleRows())
export default defineStore('sudoku', {
    state: () => ({
        puzzle: blankPuzzle as SudokuPuzzle,
        usingPencil: false,
        selectedCell: {
          x: undefined as number | undefined,
          y: undefined as number | undefined,
        },
        actions: [] as Action[]
    }),
    actions: {
      async getNewPuzzle(options: SudokuOptions) {
        this.puzzle = await sudokuService.fetchPuzzle(options)
      },
      setCell(cell: Cell, x: number, y: number) {
        const prevCell = this.puzzle.getCell(x, y);
        this.actions.push({prevCell, x, y})
        this.puzzle.setCell(cell, x, y);
      },
      getCell(x:number | undefined, y: number | undefined) {
        const cell = this.puzzle.getCell(x,y)
        return lodash.cloneDeep(cell);
      },
      undoAction() {
        const action = this.actions.pop();
        if(action === undefined || action.prevCell === undefined) {
          return;
        }
        this.puzzle.setCell(action.prevCell, action.x, action.y)
        this.selectedCell = { x: action.x, y: action.y}
      }
    },
    getters: {
      loading(state) {
        return state.puzzle === undefined
      },
      isPuzzleSolved(state) {
        if(state.puzzle.rows.some((row) => row.some((cell) => cell.value === undefined))) {
          console.log('Puzzle Unfinished')
          return false;
        }
        let hasError = false;
        for(let rowIndex = 0; rowIndex < state.puzzle.cellsPerRow; rowIndex++) {
          for(let columnIndex = 0; columnIndex < state.puzzle.cellsPerRow; columnIndex++) {
            hasError = cellHasError(state.puzzle, columnIndex, rowIndex)
            if(hasError) {
              console.log(`Error found at x:${columnIndex}, y:${rowIndex}`)
              return false
            }
          }
        }
        return true;
      }
    }
})
