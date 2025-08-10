import { defineStore } from "pinia";
import type { Row } from "./models/row";
import { SudokuPuzzle, type SudokuOptions } from "./models/puzzle";
import sudokuService from "@/services/sudokuService";
import { buildBlankPuzzleRows } from "@/utils/buildPuzzle";
import type { Action } from "@/stores/models/action.d.ts";
import type { Cell } from "./models/cell";
import lodash from 'lodash'
import { cellHasError } from "@/utils/cellHasError";
import { numberWorksInCell } from "@/utils/numberWorksInCell";
import { calcBlockNum } from "@/utils/calcBlockNumber";
export type Rows = Map<number, Row>
const blankPuzzle = new SudokuPuzzle(buildBlankPuzzleRows())
export const useSudokuStore = defineStore('sudoku', {
    state: () => ({
        puzzleId: '',
        puzzle: blankPuzzle as SudokuPuzzle,
        usingPencil: false,
        selectedCell: {
          x: undefined as number | undefined,
          y: undefined as number | undefined,
        },
        actions: [] as Action[],
        autoCandidateMode: false
    }),
    actions: {
      retrieveLocalState() {
        const state = sudokuService.retrieveLocalState();
        if(state !== null) {
          this.$patch(state)
          return true;
        }
        return false
      },
      saveGameStateLocal() {
        const state = {
          puzzleId: this.puzzleId,
          puzzle: this.puzzle,
          usingPencil: this.usingPencil,
          selectedCell: this.selectedCell,
          actions: this.actions,
          autoCandidateMode: this.autoCandidateMode
        }
        sudokuService.saveGameStateLocally(state)
      },
      async getNewPuzzle(options: SudokuOptions, token: string | undefined) {
        const response = await sudokuService.fetchNewPuzzle(options, token);
        if(response) {
          this.$patch({
            puzzleId: response._id,
            puzzle: new SudokuPuzzle(response.cells, { difficulty: response.difficulty.rating }),
            selectedCell: {
              x: undefined,
              y: undefined
            },
            actions: []
          })
          this.saveGameStateLocal();
        }
      },
      setCell(cell: Cell, x: number, y: number) {
        const prevCell = this.puzzle.getCell(x, y);
        this.actions.push({prevCell, x, y})
        this.puzzle.setCell(cell, x, y);
        if(this.autoCandidateMode && !prevCell?.value && cell.value) {
           const row = this.puzzle.rows[y];
           const col = this.puzzle.getColumn(x)!;
           const block = this.puzzle.getBlock(calcBlockNum(y,x, this.puzzle.rows))!
           const value = cell.value;
           for(const cell of row) {
            if(cell.candidates.includes(value)) {
              cell.candidates = cell.candidates.filter((candidate) => candidate !== value);
            }
           }
           for(const cell of col) {
            if(cell.candidates.includes(value)) {
              cell.candidates = cell.candidates.filter((candidate) => candidate !== value);
            }
           }
           for(const cell of block) {
            if(cell.candidates.includes(value)) {
              cell.candidates = cell.candidates.filter((candidate) => candidate !== value);
            }
           }
        }
        this.saveGameStateLocal();
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
        this.saveGameStateLocal()
      },
      resetPuzzle() {
        this.puzzle.rows = this.puzzle.originalPuzzle;
        this.actions = []
        this.selectedCell = {x: undefined, y: undefined}
        this.saveGameStateLocal();
      },
      fillPuzzleCandidates() {
        for(let candidate = 1; candidate <= this.puzzle.cellsPerRow; candidate++) {
          for(let rowIndex = 0; rowIndex < this.puzzle.rows.length; rowIndex++) {
            for(let colIndex = 0; colIndex < this.puzzle.rows.length; colIndex++) {
              const cell = this.puzzle.rows[rowIndex][colIndex];
              if(cell.value) {
                continue;
              }
              if(numberWorksInCell(rowIndex, colIndex, candidate, this.puzzle) && !cell.candidates.includes(candidate)) {
                cell.candidates.push(candidate);
              }
            }
          }
        }
      },
      clearPuzzleCandidates() {
        for(const row of this.puzzle.rows) {
          for(const cell of row) {
            cell.candidates = []
          }
        }
      }
    },
    getters: {
      loading(state) {
        return state.puzzle === undefined
      },
      isPuzzleSolved(state) {
        if(state.puzzle.rows.some((row) => row.some((cell) => cell.value === null))) {
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
