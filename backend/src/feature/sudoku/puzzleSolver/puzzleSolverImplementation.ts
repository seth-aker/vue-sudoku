import z from "zod/v4";
import { BlockIndice as BlockIndexSet } from "../datasource/models/blockIndexSet";
import { Cell } from "../datasource/models/cell"
import { Row } from "../datasource/models/row"
import { PuzzleSolverError } from "../errors/puzzleSolverError";
import { cellSchema } from "../middleware/validation/schema/cell";

export class PuzzleSolverImplementation {
  private puzzle: Row[];
  private BLOCK_WIDTH: number
  private BLOCK_INDICES: BlockIndexSet[]
  constructor(rows: Row[]) {
    if(rows.length < 9 || !Number.isInteger(Math.sqrt(rows.length))) {
      throw new PuzzleSolverError("Puzzle malformed: Not a square puzzle")
    }
    rows.forEach((row) => {
      if(row.length < 9 || !Number.isInteger(Math.sqrt(row.length))) {
        throw new PuzzleSolverError("Puzzle malformed: Not a square puzzle")
      }
      row.forEach((cell) => {
        const res = cellSchema.safeParse(cell);
        if(res.error) {
          throw new PuzzleSolverError(`Puzzle malformed: Cell validation error: ${z.flattenError(res.error)}`)
        }
      }) 
    })
    
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
  
  fillPuzzlePencilValues(puzzleRows?: Row[]): Row[] {
    const puzzle = puzzleRows ?? this.puzzle
    for(let row = 0; row < puzzle.length; row++) {
      for(let col = 0; col < puzzle[row].length; col++){
        const cell = puzzle[row][col] 
        if(!!cell.value) {
          continue;
        }
        this.fillCellPencilValues(row, col, puzzle);
      }
    }
    return puzzle;
  }

  fillCellPencilValues(rowIndex: number, colIndex: number, puzzleRows?: Row[]) {
    const puzzle = puzzleRows ?? this.puzzle;
    const cell = puzzle[rowIndex][colIndex];
    for(let i = 0; i < puzzle.length; i++) {
      const potentialNum = i + 1;
      if(cell.pencilValues.includes(potentialNum)) {
        continue;
      }
      if(this.numberWorksInCell(rowIndex, colIndex, potentialNum, puzzle)) {
        cell.pencilValues.push(potentialNum)
      }
    }
  }

  findSingle(puzzleRows?: Row[]) {
    const puzzle = puzzleRows ?? this.puzzle;
    for(let rowIndex = 0; rowIndex < puzzle.length; rowIndex++) {
      for(let colIndex = 0; colIndex < puzzle.length; colIndex++) {
        const cell = puzzle[rowIndex][colIndex];
        if(cell.value) {
          continue;
        }
        if(cell.pencilValues.length === 1) {
          return cell;
        }
        if(this.hasHiddenSingle(rowIndex, colIndex, puzzle)) {
          return {cell, rowIndex, colIndex};
        }
      }
    }
  }

  findLockedPencilValue(puzzleRows?: Row[]) {
    const puzzle = puzzleRows ?? this.puzzle;
    // Search rows for locked pencil values
    for(let i = 0; i < puzzle.length; i++) {
      const lockedValueInRow = this.findLockedPencilValueInRowsType1(i, puzzle);
      if(lockedValueInRow) {
        return lockedValueInRow;
      }
      const lockedValueInCol = this.findLockedPencilValueInColsType1(i, puzzle);
      if(lockedValueInCol) {
        return lockedValueInCol
      }
    }
    const lockedValueInRow = this.findLockedPencilValueInRowsType2(puzzle);
    if(lockedValueInRow) {
      return lockedValueInRow;
    }
    const lockedValueInCol = this.findLockedPencilValueInColsType2(puzzle);
    if(lockedValueInCol) {
      return lockedValueInCol
    }
  }

  private findLockedPencilValueInRowsType1( blockNum: number, puzzleRows?: Row[]): {value: number, rowIndex: number, colIndex:number} | undefined {
    const puzzle = puzzleRows ?? this.puzzle;
    const block = this.BLOCK_INDICES[blockNum]
    for(let rowIndex = block.rowIndices[0]; rowIndex < block.rowIndices[block.rowIndices.length - 1]; rowIndex++) {
      const pencilValueInBlockRow = new Set<number>();
      for(let colIndex = block.colIndices[0]; colIndex < block.colIndices[block.colIndices.length - 1]; colIndex++) {
        const cell = puzzle[rowIndex][colIndex];
        if(cell.value) {
          continue;
        }
        cell.pencilValues.forEach((value) => {
          pencilValueInBlockRow.add(value);
        })
      }
      const otherBlockRowPencilValues = new Set<number>();
      for(let i = block.rowIndices[0]; i < block.rowIndices[block.rowIndices.length - 1]; i++) {
        if(i === rowIndex) {
          continue;
        }
        const row = puzzle[i]
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
          return {value, rowIndex, colIndex: undefined, block: undefined};
        }
      })
      return undefined;
    }
  }
  private findLockedPencilValueInRowsType2(puzzleRows?: Row[]) {
    const puzzle = puzzleRows ?? this.puzzle;
    for(let candidate = 0; candidate < puzzle.length; candidate++ ){
      for(let rowIndex = 0; rowIndex < puzzle.length; rowIndex++) {
        const cellsWithCandidate = [] as {rowIndex: number, colIndex: number}[]
        for(let colIndex = 0; colIndex < puzzle.length; colIndex++){
          if(cellsWithCandidate.length > this.BLOCK_WIDTH) {
            break;
          }
          const cell = puzzle[rowIndex][colIndex];
          if(cell.value) {
            continue;
          }
          if(cell.pencilValues.includes(candidate)) {
            cellsWithCandidate.push({rowIndex, colIndex})
          }
        }
        if(cellsWithCandidate.length > this.BLOCK_WIDTH) {
          continue;
        }
        const blocksCandidateIsIn = new Set<number>();
        cellsWithCandidate.forEach((cell) => {
          const block = this.BLOCK_INDICES.findIndex((eachBlockSet) => eachBlockSet.colIndices.includes(cell.colIndex) && eachBlockSet.rowIndices.includes(cell.rowIndex))
          if(block === -1) {
            throw new PuzzleSolverError("Something went horribly wrong...")
          }
          blocksCandidateIsIn.add(block)
        })
        if(blocksCandidateIsIn.size === 1) {
          return {value: candidate, rowIndex, colIndex: undefined, block: blocksCandidateIsIn.values().next().value as number}
        }
      }
    }
    return undefined;
  }
  
  private findLockedPencilValueInColsType1(blockNum: number, puzzleRows?: Row[]): {value: number, rowIndex: number, colIndex:number} | undefined {
    const puzzle = puzzleRows ?? this.puzzle;
    const block = this.BLOCK_INDICES[blockNum];
    for(let colIndex = block.colIndices[0]; colIndex < block.colIndices[block.colIndices.length - 1]; colIndex++ ) {
      const pencilValueInBlockCol = new Set<number>();
      for(let rowIndex = block.rowIndices[0]; rowIndex < block.rowIndices[block.rowIndices.length -1]; rowIndex++) {
        const cell = puzzle[rowIndex][colIndex];
        if(cell.value){
          continue;
        }
        cell.pencilValues.forEach((value) => {
          pencilValueInBlockCol.add(value);
        })
      }
      const otherBlockPencilValues = new Set<number>();
      for(let i = block.colIndices[0]; i < block.colIndices[block.colIndices.length -1]; i++) {
        if(i === colIndex) {
          continue;
        }
        const col = this.getColumn(i, puzzle);
        for(let rowIndex = 0; rowIndex < col.length; rowIndex++) {
          if(block.rowIndices.includes(colIndex)) {
            continue;
          }
          const cell = col[colIndex]
          if(cell.value) {
            continue;
          }
          cell.pencilValues.forEach((value) => {
            otherBlockPencilValues.add(value)
          })
        }
      }
      pencilValueInBlockCol.forEach((value) => {
        if(!otherBlockPencilValues.has(value)) {
          return { value, rowIndex: undefined, colIndex, block: undefined}
        }
      })
      return undefined;
    }
  }
  private findLockedPencilValueInColsType2(puzzleRows?: Row[]) {
    const puzzle = puzzleRows ?? this.puzzle;
    for(let candidate = 0; candidate < puzzle.length; candidate++ ) {
      for(let colIndex = 0; colIndex < puzzle.length; colIndex++) {
        const cellsWithCandidate = [] as { rowIndex: number, colIndex: number}[]
        for(let rowIndex = 0; rowIndex < puzzle.length; rowIndex++ ) {
          if(cellsWithCandidate.length > this.BLOCK_WIDTH) {
            break;
          }
          const cell = puzzle[rowIndex][colIndex]
          if(cell.value) {
            continue;
          }
          if(cell.pencilValues.includes(candidate)) {
            cellsWithCandidate.push({rowIndex, colIndex});
          }
        }
        if(cellsWithCandidate.length > this.BLOCK_WIDTH) {
          continue;
        }
        const blocksCandidateIsIn = new Set<number>();
        cellsWithCandidate.forEach((cell) => {
          const block = this.BLOCK_INDICES.findIndex((eachBlockSet) => eachBlockSet.colIndices.includes(cell.colIndex) && eachBlockSet.rowIndices.includes(cell.rowIndex))
          if(block === -1) {
            throw new PuzzleSolverError("Something went horribly wrong...")
          }
          blocksCandidateIsIn.add(block)
        })
        if(blocksCandidateIsIn.size === 1) {
          return {value: candidate, rowIndex: undefined, colIndex, block: blocksCandidateIsIn.values().next().value as number}
        }
      }
    }
    return undefined
  }

  private hasHiddenSingle( rowIndex: number, colIndex: number, puzzleRows: Row[]) {
    const puzzle = puzzleRows ?? this.puzzle;
    const cell = puzzle[rowIndex][colIndex]
    const blockWidth = Math.floor(Math.sqrt(puzzle.length));
    const blockX = Math.floor(colIndex / blockWidth);
    const blockY = Math.floor(rowIndex / blockWidth)
    const blockNum = blockX + (blockY * blockWidth);
    const pencilRow = puzzle[rowIndex].filter((eachCell) => eachCell.cellId !== cell.cellId).map((eachCell) => eachCell.pencilValues)
    const pencilCol = this.getColumn(colIndex, puzzle).filter((eachCell) => eachCell.cellId !== cell.cellId).map((eachCell) => eachCell.pencilValues)
    const pencilBlock = this.getBlock(blockNum, puzzle).filter((eachCell) => eachCell.cellId !== cell.cellId).map((eachCell) => eachCell.pencilValues)
    
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
  getBlock(num: number, puzzleRows?: Row[]) {
    const puzzle = puzzleRows ?? this.puzzle;
    const block = new Array<Cell>(puzzle.length);
    const blockWidth = Math.sqrt(puzzle.length); // this should be always an integer!!!
    const yStartIndex = num - (num % blockWidth)
    const xStartIndex = blockWidth * (num % blockWidth)
    for(let i = 0; i < puzzle.length; i++) {
      block[i] = puzzle[yStartIndex + Math.floor(i / blockWidth)][xStartIndex + (i % blockWidth)]
    }
    return block
  }

  getColumn( num: number, puzzleRows?: Row[]) {
    const puzzle = puzzleRows ?? this.puzzle;
    const column = new Array<Cell>(puzzle.length);
    for(let i = 0; i < puzzle.length; i++) {
      column[i] = puzzle[i][num]
    }
    return column;
  }

  numberWorksInCell(rowIndex: number, colIndex: number, potentialNum: number, puzzleRows?: Row[]) {
    const puzzle = puzzleRows ?? this.puzzle;
    const cell = puzzle[rowIndex][colIndex];
    const blockWidth = Math.floor(Math.sqrt(puzzle.length));
    const blockX = Math.floor(colIndex / blockWidth);
    const blockY = Math.floor(rowIndex / blockWidth)
    const blockNum = blockX + (blockY * blockWidth);
    const block = this.getBlock(blockNum, puzzle)?.filter((eachCell) => eachCell.cellId !== cell.cellId);
    const row = puzzle[rowIndex].filter((eachCell) => eachCell.cellId != cell.cellId)
    const col = this.getColumn(colIndex, puzzle)?.filter((eachCell) => eachCell.cellId !== cell.cellId)

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
