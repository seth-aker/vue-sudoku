import type { Cell } from "./cell";
import type { Row } from "./row";

export class SudokuPuzzle {
    readonly originalCells: Array<Row>;
    readonly cellsPerRow: number;
    rows: Array<Row>;
    constructor(rows: Array<Row>) {
        this.rows = rows,
        this.originalCells = rows
        this.cellsPerRow = rows.length
    }


    getBlock(num: number) {
        const block = new Array<Cell>(this.cellsPerRow);
        // num % 3 gives 0, 1, or 2 
        // num / 3 gives 
        for(let i = 0; i < this.cellsPerRow; i++) {
           block[i] = 
            
        }


    }
    
}