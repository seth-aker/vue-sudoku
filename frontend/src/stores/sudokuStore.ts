import { defineStore } from "pinia";
import type { Row } from "./models/row";
import { SudokuPuzzle, type SudokuOptions } from "./models/puzzle";
import sudokuService from "@/services/sudokuService";
import { buildBlankPuzzleRows } from "@/utils/buildPuzzle";
import type { Action } from "@/stores/models/action.d.ts";
import type { Cell } from "./models/cell";
export type Rows = Map<number, Row>
const blankPuzzle = new SudokuPuzzle(buildBlankPuzzleRows())
export default defineStore('sudoku', {
    state: () => ({
        puzzle: blankPuzzle as SudokuPuzzle,
        usingPencil: false,
        selectedCell: {
          x: undefined as number | undefined,
          y: undefined as number | undefined,
          value: undefined as number | undefined
        },
        actions: [] as Action[]
    }),
    actions: {
      async getNewPuzzle(options: SudokuOptions) {
        this.puzzle = await sudokuService.fetchPuzzle(options)
      },
      setCell(cell: Cell, x: number, y: number) {
        this.actions.push({cell, x, y})
        this.puzzle.setCell(cell, x, y);
      },
      getCell(x:number | undefined, y: number | undefined) {
        return this.puzzle.getCell(x, y)
      },
      undoAction() {
        const action = this.actions.pop();
        console.log(action)
        if(action === undefined) {
          return;
        }
        this.puzzle.setCell(action.cell, action.x, action.y)
      }
    },
    getters: {
      loading(state) {
        return state.puzzle === undefined
      }
    }
})
