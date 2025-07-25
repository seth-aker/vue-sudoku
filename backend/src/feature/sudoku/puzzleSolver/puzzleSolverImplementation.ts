import z from "zod/v4";
import { BlockIndice as BlockIndexSet } from "../datasource/models/blockIndexSet.ts";
import { Cell } from "../datasource/models/cell.ts"
import { Row } from "../datasource/models/row.ts"
import { PuzzleSolverError } from "../errors/puzzleSolverError.ts";
import { cellSchema } from "../middleware/validation/schema/cell.ts";

export class PuzzleSolverImplementation {
  private puzzle: Row[];
  private BLOCK_WIDTH: number
  private BLOCK_INDICES: BlockIndexSet[]
  constructor(rows: Row[]) {
    this.validatePuzzle(rows);
    this.puzzle = rows;
    this.BLOCK_WIDTH = Math.sqrt(rows.length)
    this.BLOCK_INDICES = this.generateBlockIndices(this.puzzle);
  }
  
  fillPuzzlePencilValues(puzzleRows?: Row[]): Row[] {
    const puzzle = puzzleRows ?? this.puzzle
    for(let row = 0; row < puzzle.length; row++) {
      for(let col = 0; col < puzzle[row].length; col++){
        const cell = puzzle[row][col] 
        if(cell.value) {
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
      const numberWorksInCell = this.numberWorksInCell(rowIndex, colIndex, potentialNum, puzzle);
      if(cell.pencilValues.has(potentialNum) && numberWorksInCell) {
        continue;
      }
      if(numberWorksInCell) {
        cell.pencilValues.add(potentialNum)
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
        if(cell.pencilValues.size === 1) {
          return {value: cell.pencilValues.values().next().value, rowIndex, colIndex}
        }
        const hiddenSingle = this.findHiddenSingle(rowIndex, colIndex, puzzle);
        if(hiddenSingle !== -1) {
          return {value: hiddenSingle, rowIndex, colIndex};
        }
      }
    }
  }

  findLockedPencilValue(puzzleRows?: Row[]): {value: number, rowIndex: number | undefined, colIndex: number | undefined, block: number} | undefined {
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
    return undefined;
  }

  solvePuzzle(puzzleRows?: Row[]) {
    const puzzle = puzzleRows ?? this.puzzle
    this.fillPuzzlePencilValues(puzzle);
    let moves = 0;
    while(!this.isPuzzleSolved(puzzle)) {
      const single = this.findSingle(puzzle);
      if(single) {
        puzzle[single.rowIndex][single.colIndex].value = single.value
        puzzle[single.rowIndex][single.colIndex].type = 'edited';
        this.removePencilValueFromRow(single.value, single.rowIndex, puzzle);
        this.removePencilValueFromCol(single.value, single.colIndex, puzzle);
        this.removePencilValuesFromBlock(single.value, this.getCellsBlockNumber(single.rowIndex, single.colIndex, puzzle));
        moves++
        continue;
      }
      const lockedValue = this.findLockedPencilValue(puzzle);
      if(lockedValue) {
        if(lockedValue.rowIndex !== undefined) {
          this.removePencilValueFromBlockRow(lockedValue.value, lockedValue.rowIndex, lockedValue.block, puzzle)
        } 
        if(lockedValue.colIndex !== undefined) {
          this.removePencilValueFromBlockCol(lockedValue.value, lockedValue.colIndex, lockedValue.block);
        }
        continue;
      }
      // If the code gets to this then it can't find any solutions.
      throw new PuzzleSolverError("Puzzle could not be solved with current tools");
    }

  }

  isPuzzleSolved(puzzleRows?: Row[]) {
    const puzzle = puzzleRows ?? this.puzzle
    for(let rowIndex = 0; rowIndex < puzzle.length; rowIndex++) {
      for(let colIndex = 0; colIndex < puzzle.length; colIndex++) {
        const cell = puzzle[rowIndex][colIndex];
        if(!cell.value || this.cellHasConflict(rowIndex, colIndex, puzzle)) {
          return false
        }
      }
    }
    return true;
  }

  private cellHasConflict(rowIndex: number, colIndex: number, puzzleRows?: Row[]) {
    const puzzle = puzzleRows ?? this.puzzle;
    const cell = puzzle[rowIndex][colIndex];
    if(!cell.value) {
      return false;
    }
    return !this.numberWorksInCell(rowIndex, colIndex, cell.value, puzzle);
  }
  private findLockedPencilValueInRowsType1( blockNum: number, puzzleRows?: Row[]) {
    const puzzle = puzzleRows ?? this.puzzle;
    const block = this.BLOCK_INDICES[blockNum]
    for(let rowIndex = block.rowIndices[0]; rowIndex <= block.rowIndices[block.rowIndices.length - 1]; rowIndex++) {
      const pencilValuesInBlockRow = new Set<number>();
      for(let colIndex = block.colIndices[0]; colIndex <= block.colIndices[block.colIndices.length - 1]; colIndex++) {
        const cell = puzzle[rowIndex][colIndex];
        if(cell.value) {
          continue;
        }
        cell.pencilValues.forEach((value) => {
          pencilValuesInBlockRow.add(value);
        })
      }
      const otherBlockRowPencilValues = new Set<number>();
      for(let i = block.rowIndices[0]; i <= block.rowIndices[block.rowIndices.length - 1]; i++) {
        if(i === rowIndex) {
          continue;
        }
        const row = puzzle[i]
        for(let cellIndex = 0; cellIndex < row.length; cellIndex++) {
          if(!block.colIndices.includes(cellIndex)) {
            continue;
          }
          const cell = row[cellIndex]
          cell.pencilValues.forEach((value) => {
            otherBlockRowPencilValues.add(value);
          })
        }
      }
      for(const value of pencilValuesInBlockRow) {
        if(!otherBlockRowPencilValues.has(value)) {
          return {value, rowIndex, colIndex: undefined, block: blockNum};
        }
      }
    }
    return undefined;
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
          if(cell.pencilValues.has(candidate)) {
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
  
  private findLockedPencilValueInColsType1(blockNum: number, puzzleRows?: Row[]) {
    const puzzle = puzzleRows ?? this.puzzle;
    const block = this.BLOCK_INDICES[blockNum];
    for(let colIndex = block.colIndices[0]; colIndex <= block.colIndices[block.colIndices.length - 1]; colIndex++ ) {
      const pencilValueInBlockCol = new Set<number>();
      for(let rowIndex = block.rowIndices[0]; rowIndex <= block.rowIndices[block.rowIndices.length -1]; rowIndex++) {
        const cell = puzzle[rowIndex][colIndex];
        if(cell.value){
          continue;
        }
        cell.pencilValues.forEach((value) => {
          pencilValueInBlockCol.add(value);
        })
      }
      const otherBlockPencilValues = new Set<number>();
      for(let i = block.colIndices[0]; i <= block.colIndices[block.colIndices.length -1]; i++) {
        if(i === colIndex) {
          continue;
        }
        const col = this.getColumn(i, puzzle);
        for(let rowIndex = 0; rowIndex < col.length; rowIndex++) {
          if(!block.rowIndices.includes(rowIndex)) {
            continue;
          }
          const cell = col[rowIndex]
          if(cell.value) {
            continue;
          }
          cell.pencilValues.forEach((value) => {
            otherBlockPencilValues.add(value)
          })
        }
      }
      for(const value of pencilValueInBlockCol) {
        if(!otherBlockPencilValues.has(value)) {
          return { value, rowIndex: undefined, colIndex, block: blockNum}
        }
      }
    }
    return undefined;
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
          if(cell.pencilValues.has(candidate)) {
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

  private findHiddenSingle( rowIndex: number, colIndex: number, puzzleRows: Row[]) {
    const puzzle = puzzleRows ?? this.puzzle;
    const cell = puzzle[rowIndex][colIndex]
    const blockNum = this.BLOCK_INDICES.findIndex((block) => block.colIndices.includes(colIndex) && block.rowIndices.includes(rowIndex))
    const pencilRow = puzzle[rowIndex].filter((eachCell) => eachCell.cellId !== cell.cellId).map((eachCell) => eachCell.pencilValues)
    const pencilCol = this.getColumn(colIndex, puzzle).filter((eachCell) => eachCell.cellId !== cell.cellId).map((eachCell) => eachCell.pencilValues)
    const pencilBlock = this.getBlock(blockNum, puzzle).filter((eachCell) => eachCell.cellId !== cell.cellId).map((eachCell) => eachCell.pencilValues)
    for(const pencilValue of cell.pencilValues) {
      let singleInRow = true;
      let singleInCol = true;
      let singleInBlock = true;
       for(const cellPencilValues of pencilRow) {
        if(cellPencilValues.has(pencilValue)) {
          singleInRow = false;
          break;
        }
      }
      for(const cellPencilValues of pencilCol) {
        if(cellPencilValues.has(pencilValue)) {
          singleInCol = false;
          break;
        }
      }
      for(const cellPencilValues of pencilBlock) {
        if(cellPencilValues.has(pencilValue)) {
          singleInBlock = false;
          break;
        }
      }
      if(singleInRow || singleInCol || singleInBlock) {
        return pencilValue;
      }
    }
    return -1;
  }
  private findPairInRow(rowIndex: number, puzzleRows?: Row[]) {
    const puzzle = puzzleRows ?? this.puzzle;
    for(let colIndex = 0; colIndex < puzzle.length; colIndex++) {
      
    }
  }
  private removePencilValueFromRow(value: number, rowIndex: number, puzzleRows?: Row[]) {
    const puzzle = puzzleRows ?? this.puzzle
    for(let colIndex = 0; colIndex < puzzle.length; colIndex++) {
      const cell = puzzle[rowIndex][colIndex];
      if(cell.value) {
        continue;
      }
      cell.pencilValues.delete(value);

    }
  }
  private removePencilValueFromCol(value: number, colIndex: number, puzzleRows?: Row[]) {
    const puzzle = puzzleRows ?? this.puzzle
    for(let rowIndex = 0; rowIndex < puzzle.length; rowIndex++) {
      const cell = puzzle[rowIndex][colIndex];
      if(cell.value) {
        continue;
      }
      cell.pencilValues.delete(value);
    }
  }
  private removePencilValuesFromBlock(value: number, blockNum: number, puzzleRows?: Row[]) {
    const puzzle = puzzleRows ?? this.puzzle;
    const block = this.getBlock(blockNum, puzzle);
    for(const cell of block) {
      if(cell.value) {
        continue;
      }
      cell.pencilValues.delete(value);
    }
  }
  private removePencilValueFromBlockRow(value: number, rowIndex: number, blockNum: number, puzzleRows?: Row[]) {
    const puzzle = puzzleRows ?? this.puzzle;
    const blockIndexSet = puzzleRows ? this.generateBlockIndices(puzzleRows)[blockNum] : this.BLOCK_INDICES[blockNum];
    for(let colIndex = blockIndexSet.colIndices[0]; colIndex <= blockIndexSet.colIndices[blockIndexSet.colIndices.length - 1]; colIndex++) {
      const cell = puzzle[rowIndex][colIndex]
      if(cell.value) {
        continue;
      }
      cell.pencilValues.delete(value);
    }
  }
    private removePencilValueFromBlockCol(value: number, colIndex: number, blockNum: number, puzzleRows?: Row[]) {
    const puzzle = puzzleRows ?? this.puzzle;
    const blockIndexSet = puzzleRows ? this.generateBlockIndices(puzzleRows)[blockNum] : this.BLOCK_INDICES[blockNum];
    for(let rowIndex = blockIndexSet.rowIndices[0]; rowIndex <= blockIndexSet.rowIndices[blockIndexSet.rowIndices.length - 1]; rowIndex++) {
      const cell = puzzle[rowIndex][colIndex]
      if(cell.value) {
        continue;
      }
      cell.pencilValues.delete(value);
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

  private getCellsBlockNumber(rowIndex: number, colIndex: number, puzzleRows?: Row[]) {
    const blockIndices = puzzleRows ? this.generateBlockIndices(puzzleRows) : this.BLOCK_INDICES;
    return blockIndices.findIndex((blockIndexSet) => blockIndexSet.rowIndices.includes(rowIndex) && blockIndexSet.colIndices.includes(colIndex));
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

  private generateBlockIndices(puzzleRows: Row[]) {
    this.validatePuzzle(puzzleRows);
    const blockWidth = Math.sqrt(puzzleRows.length);
    const blockIndices = [] as BlockIndexSet[];
    for(let blockNum = 0; blockNum < puzzleRows.length; blockNum++) {
      const yStartIndex = blockNum - (blockNum % blockWidth);
      const xStartIndex = blockWidth * (blockNum % blockWidth)
      const blockIndiceSet: BlockIndexSet = { rowIndices: [], colIndices: [] }
      // Populate the block index starting with the start index and adding indexs until the block width
      for(let i = 0; i < blockWidth; i++ ) {
        blockIndiceSet.rowIndices.push(yStartIndex + i)
        blockIndiceSet.colIndices.push(xStartIndex + i)
      }
      blockIndices.push(blockIndiceSet)
    }
    return blockIndices;
  }
  
  private validatePuzzle(puzzleRows: Row[]) {
    if(puzzleRows.length < 9 || !Number.isInteger(Math.sqrt(puzzleRows.length))) {
      throw new PuzzleSolverError("Puzzle malformed: Not a square puzzle")
    }
    puzzleRows.forEach((row) => {
      if(row.length < 9 || row.length !== puzzleRows.length || !Number.isInteger(Math.sqrt(row.length))) {
        throw new PuzzleSolverError("Puzzle malformed: Not a square puzzle")
      }
      row.forEach((cell) => {
        const res = cellSchema.safeParse(cell);
        if(res.error) {
          throw new PuzzleSolverError(`Puzzle malformed: Cell validation error: ${z.flattenError(res.error)}`)
        }
      }) 
    })
  }
}
