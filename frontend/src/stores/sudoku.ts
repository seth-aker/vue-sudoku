import { defineStore } from "pinia";
import type { Row } from "./models/row";
import type { SudokuPuzzle } from "./models/puzzle";
import type { Difficulty } from "./models/difficulty";
import sudokuService from "@/services/sudokuService";

export type Rows = Map<number, Row>

export default defineStore('sudoku', {
    state: () => ({
        puzzle: undefined as SudokuPuzzle | undefined,
        usingPencil: false,
    }),
    actions: {
      async getPuzzle(difficulty: Difficulty) {
        return await sudokuService.fetchPuzzle(difficulty)
      }
    }
})
