import { defineStore } from "pinia";
import type { Row } from "./models/row";
import { SudokuPuzzle, type SudokuOptions } from "./models/puzzle";
import sudokuService from "@/services/sudokuService";
import { buildBlankPuzzleRows } from "@/utils/buildPuzzle";

export type Rows = Map<number, Row>
const blankPuzzle = new SudokuPuzzle(buildBlankPuzzleRows())
export default defineStore('sudoku', {
    state: () => ({
        puzzle: blankPuzzle as SudokuPuzzle,
        usingPencil: false,
    }),
    actions: {
      async getNewPuzzle(options: SudokuOptions) {
        this.puzzle = await sudokuService.fetchPuzzle(options)
      }
    },
    getters: {
      loading(state) {
        return state.puzzle === undefined
      }
    }
})
