import { defineStore } from "pinia";
import type { Row } from "./models/row";
import type { SudokuOptions, SudokuPuzzle } from "./models/puzzle";
import sudokuService from "@/services/sudokuService";

export type Rows = Map<number, Row>

export default defineStore('sudoku', {
    state: () => ({
        puzzle: undefined as SudokuPuzzle | undefined,
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
