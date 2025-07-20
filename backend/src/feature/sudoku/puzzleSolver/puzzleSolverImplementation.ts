import { BlockIndice as BlockIndexSet } from "../datasource/models/blockIndexSet";
import { Cell } from "../datasource/models/cell"
import { Row } from "../datasource/models/row"
import { PuzzleSolverError } from "../errors/puzzleSolverError";

export class PuzzleSolverImplementation {
  private puzzle: Row[];
  private BLOCK_WIDTH: number
  private BLOCK_INDICES: BlockIndexSet[]
  constructor(rows: Row[]) {
    if(!Number.isInteger(Math.sqrt(rows.length))) {
      throw new PuzzleSolverError("Puzzle malformed: Not a square puzzle")
    }
    this.puzzle = rows;
    this.BLOCK_WIDTH = Math.sqrt(rows.length)
    
    this.BLOCK_INDICES = [];
    for(let blockNum = 0; blockNum < this.puzzle.length; blockNum++) {
      const yStartIndex = blockNum - (blockNum % this.BLOCK_WIDTH);
      const xStartIndex = this.BLOCK_WIDTH * (blockNum % this.BLOCK_WIDTH)
      const blockIndiceSet: BlockIndexSet = { rowIndices: [], colIndices: [] }
      // Populate the block index starting with the start index and adding indexs until the block width
      for(let i = 0; i < this.BLOCK_WIDTH; i++ ) {
        blockIndiceSet.rowIndices.push(yStartIndex + i)
        blockIndiceSet.colIndices.push(xStartIndex + i)
      }
      this.BLOCK_INDICES.push(blockIndiceSet)
    }
  }
  
  buildBlankPuzzleRows(rowLength: number) {
    if(!Number.isInteger(Math.sqrt(rowLength))){
      throw new Error(`Error: Square Root of rowLength not an integer`)
    }
    const rows = [] as Row[]
    for(let i = 0; i < rowLength; i++) {
      const row = [] as Row
      for(let j = 0; j < rowLength; j++) {
        const cell: Cell = {
          cellId: `C${j}${i}`,
          type: 'blank',
          value: undefined,
          pencilValues: []
        }
        row.push(cell)
      }
      rows.push(row)
    }
    return rows
  }
  fillPuzzlePencilValues(puzzleRows: Row[]): Row[] {
    for(let row = 0; row < puzzleRows.length; row++) {
      for(let col = 0; col < puzzleRows[row].length; col++){
        const cell = puzzleRows[row][col] 
        if(!!cell.value) {
          continue;
        }
        this.fillCellPencilValues(puzzleRows, row, col);
      }
    }
    return puzzleRows;
  }

  fillCellPencilValues(puzzleRows: Row[], rowIndex: number, colIndex: number) {
    const cell = puzzleRows[rowIndex][colIndex];
    for(let i = 0; i < puzzleRows.length; i++) {
      const potentialNum = i + 1;
      if(cell.pencilValues.includes(potentialNum)) {
        continue;
      }
      if(this.numberWorksInCell(puzzleRows, rowIndex, colIndex, potentialNum)) {
        cell.pencilValues.push(potentialNum)
      }
    }
  }

  findSingle(puzzleRows: Row[]) {
    for(let rowIndex = 0; rowIndex < puzzleRows.length; rowIndex++) {
      for(let colIndex = 0; colIndex < puzzleRows.length; colIndex++) {
        const cell = puzzleRows[rowIndex][colIndex];
        if(cell.pencilValues.length === 1) {
          return cell;
        }
        if(this.hasHiddenSingle(puzzleRows, rowIndex, colIndex)) {
          return {cell, rowIndex, colIndex};
        }
      }
    }
  }

  findLockedPencilValue(puzzleRows: Row[]) {
    // Search rows for locked pencil values
    for(let i = 0; i < puzzleRows.length; i++) {
      const lockedValueInRow = this.findBlockLockedPencilValueInRows(puzzleRows, i);
      if(lockedValueInRow) {
        return lockedValueInRow;
      }
      const lockedValueInCol = this.findBlockLockedPencilValueInCols(puzzleRows, i);
    }
  }
  private findBlockLockedPencilValueInRows(puzzleRows: Row[], blockNum: number) {
    const block = this.BLOCK_INDICES[blockNum]
    for(let rowIndex = block.rowIndices[0]; rowIndex < block.rowIndices[block.rowIndices.length - 1]; rowIndex++) {
      
      const pencilValueInBlockRow = new Set<number>();
      for(let colIndex = block.colIndices[0]; colIndex < block.colIndices[block.colIndices.length - 1]; colIndex++) {
        const cell = puzzleRows[rowIndex][colIndex];
        if(cell.value) {
          continue;
        }
        cell.pencilValues.forEach((value) => {
          pencilValueInBlockRow.add(value);
        })
      }
      const otherBlockRowPencilValues = new Set<number>();
      for(let i = rowIndex + 1; i < block.rowIndices[block.rowIndices.length - 1]; i++) {
        const row = puzzleRows[i]
        for(let cellIndex = 0; cellIndex < row.length; cellIndex++) {
          if(block.colIndices.includes(cellIndex)) {
            continue;
          }
          const cell = row[cellIndex]
          cell.pencilValues.forEach((value) => {
            otherBlockRowPencilValues.add(value);
          })
        }
      }
      pencilValueInBlockRow.forEach((value) => {
        if(!otherBlockRowPencilValues.has(value)) {
          return {value, rowIndex, colIndex: undefined};
        }
      })
      return undefined;
    }
  }
  private findBlockLockedPencilValueInCols(puzzleRows: Row[], blockNum: number) {
    const block = this.BLOCK_INDICES[blockNum];
    for(let colIndex = block.colIndices[0]; colIndex < block.colIndices[block.colIndices.length - 1]; colIndex++ ) {
      
    }
  }

  private hasHiddenSingle(puzzleRows: Row[], rowIndex: number, colIndex: number) {
    const cell = puzzleRows[rowIndex][colIndex]
    const blockWidth = Math.floor(Math.sqrt(puzzleRows.length));
    const blockX = Math.floor(colIndex / blockWidth);
    const blockY = Math.floor(rowIndex / blockWidth)
    const blockNum = blockX + (blockY * blockWidth);
    const pencilRow = puzzleRows[rowIndex].filter((eachCell) => eachCell.cellId !== cell.cellId).map((eachCell) => eachCell.pencilValues)
    const pencilCol = this.getColumn(puzzleRows, colIndex).filter((eachCell) => eachCell.cellId !== cell.cellId).map((eachCell) => eachCell.pencilValues)
    const pencilBlock = this.getBlock(puzzleRows, blockNum).filter((eachCell) => eachCell.cellId !== cell.cellId).map((eachCell) => eachCell.pencilValues)
    
    for(let i = 0; i < cell.pencilValues.length; i++ ) {
      const pencilValue = cell.pencilValues[i];
      pencilRow.forEach((cellPencilValues) => {
        if(cellPencilValues.includes(pencilValue)) {
          return false;
        }
      })
      pencilCol.forEach((cellPencilValues) => {
        if(cellPencilValues.includes(pencilValue)) {
          return false
        }
      })
      pencilBlock.forEach((cellPencilValues) => {
        if(cellPencilValues.includes(pencilValue)) {
          return false;
        }
      })
      return true;
    }
  }
  private getBlock(puzzleRows: Row[], num: number) {
    const block = new Array<Cell>(puzzleRows.length);
    const blockWidth = Math.sqrt(puzzleRows.length); // this should be always an integer!!!
    const yStartIndex = num - (num % blockWidth)
    const xStartIndex = blockWidth * (num % blockWidth)
    for(let i = 0; i < puzzleRows.length; i++) {
      block[i] = puzzleRows[yStartIndex + Math.floor(i / blockWidth)][xStartIndex + (i % blockWidth)]
    }
    return block
  }

  private getColumn(puzzleRows: Row[], num: number) {
    const column = new Array<Cell>(puzzleRows.length);
    for(let i = 0; i < puzzleRows.length; i++) {
      column[i] = puzzleRows[i][num]
    }
    return column;
  }

  private numberWorksInCell(puzzleRows: Row[], rowIndex: number, colIndex: number, potentialNum: number) {
    const cell = puzzleRows[rowIndex][colIndex];
    const blockWidth = Math.floor(Math.sqrt(puzzleRows.length));
    const blockX = Math.floor(colIndex / blockWidth);
    const blockY = Math.floor(rowIndex / blockWidth)
    const blockNum = blockX + (blockY * blockWidth);
    const block = this.getBlock(puzzleRows, blockNum)?.filter((eachCell) => eachCell.cellId !== cell.cellId);
    const row = puzzleRows[rowIndex].filter((eachCell) => eachCell.cellId != cell.cellId)
    const col = this.getColumn(puzzleRows, colIndex)?.filter((eachCell) => eachCell.cellId !== cell.cellId)

    if(block?.some((eachCell) => eachCell.value === potentialNum)) {
      return false
    }
    if(row.some((eachCell) => eachCell.value === potentialNum)) {
      return false
    }
    if(col?.some((eachCell) => eachCell.value === potentialNum)) {
      return false;
    }
    return true;
  }

  setPuzzle(puzzle: Row[]) {
    this.puzzle = puzzle;
  }
  getPuzzle() {
    return this.puzzle;
  }
}
