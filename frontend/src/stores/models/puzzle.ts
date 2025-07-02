import type { Cell } from "./cell";
import type { Difficulty } from "./difficulty";
import type { Row } from "./row";
export interface SudokuOptions {
  difficulty: Difficulty
}
export class SudokuPuzzle {
    readonly originalCells: Array<Row>;
    readonly cellsPerRow: number;
    readonly difficulty: Difficulty;
    rows: Array<Row>;
    constructor(rows: Array<Row>, options: SudokuOptions = {difficulty: 'medium'}) {
        if(!Number.isInteger(Math.sqrt(rows.length))) {
          throw new Error(`Row length of ${rows.length} is invalid for proper sudoku puzzles.`)
        }
        this.rows = rows,
        this.originalCells = rows
        this.cellsPerRow = rows.length
        this.difficulty = options.difficulty;
    }
    /**
     * Takes a number (0 - 8 for standard sudoku) and returns the block of digits from that space.
     * 0 is the top left block, 8 is the bottom right block
     * @param num number
     * @returns Array<Cell> | undefined
     */
    getBlock(num: number) {
        if(num >= this.cellsPerRow || num < 0) {
          return undefined
        }
        const block = new Array<Cell>(this.cellsPerRow);
        const blockWidth = Math.sqrt(this.cellsPerRow); // this should be always an integer!!!
        const yStartIndex = num - (num % blockWidth)
        const xStartIndex = blockWidth * (num % blockWidth)
        for(let i = 0; i < this.cellsPerRow; i++) {
          block[i] = this.rows[yStartIndex + Math.floor(i / blockWidth)][xStartIndex + (i % blockWidth)]
        }
        return block
    }
    getColumn(num: number) {
      if(num >= this.cellsPerRow || num < 0) {
        return undefined
      }
      const column = new Array<Cell>(this.cellsPerRow);
      for(let i = 0; i < this.cellsPerRow; i++) {
        column[i] = this.rows[i][num]
      }
      return column;
    }
}
