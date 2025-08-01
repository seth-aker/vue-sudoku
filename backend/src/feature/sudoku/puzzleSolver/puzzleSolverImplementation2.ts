import z from "zod/v4";
import { Row } from "../datasource/models/row";
import { PuzzleSolverError } from "../errors/puzzleSolverError";
import { cellSchema } from "../middleware/validation/schema/cell";
import { PuzzleSolver } from "./puzzleSolver";
import { Strategies, StrategiesUsed } from "./strategies";
import { Cell } from "../datasource/models/cell";
import { shuffleArray } from "../utils/shuffleArray";

export class PuzzleSolverImplementation2 implements PuzzleSolver {
  solvePuzzle(puzzle: Row[]) {
    this.validatePuzzle(puzzle);
    const initialPuzzle = structuredClone(puzzle);
    const strategiesUsed = {} as StrategiesUsed;
    this.fillPuzzleCandidates(puzzle);
    this._solve(puzzle, strategiesUsed);
    return { initialPuzzle, solvedPuzzle: puzzle, strategiesUsed }
  }

  isPuzzleSolved(puzzle: Row[], validate = true) {
    if(validate) {
      this.validatePuzzle(puzzle)
    }
    for(let rowIndex = 0; rowIndex < puzzle.length; rowIndex++) {
      for(let colIndex = 0; colIndex < puzzle.length; colIndex++) {
        const cell = puzzle[rowIndex][colIndex];
        if(!cell.value || !this.numberWorksInCell(rowIndex, colIndex, cell.value, puzzle)) {
          return false
        }
      }
    }
    return true;
  }
  numberWorksInCell(rowIndex: number, colIndex: number, potentialNum: number, puzzle: Row[]) {
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
  fillPuzzleCandidates(puzzle: Row[]) {
    for(let potentialCandidate = 1; potentialCandidate <= puzzle.length; potentialCandidate++) {
      for(let row = 0; row < puzzle.length; row++) {
        for(let col = 0; col < puzzle.length; col++) {
          const cell = puzzle[row][col];
          if(cell.value || !this.numberWorksInCell(row, col, potentialCandidate, puzzle)) {
            continue;
          }
          cell.candidates.add(potentialCandidate);
        }
      }
    }
    return puzzle;
  }

  getBlock(num: number, puzzle: Row[]) {
    const block = [] as Cell[];
    const blockWidth = Math.sqrt(puzzle.length); // this should be always an integer!!!
    const startRow = Math.floor(num / blockWidth) * blockWidth;
    const startCol = (num % blockWidth) * blockWidth;
    for(let rowIndex = 0; rowIndex < blockWidth; rowIndex++) {
      for(let colIndex = 0; colIndex < blockWidth; colIndex++) {
        block.push(puzzle[startRow + rowIndex][startCol + colIndex])
      }
    }
    return block
  }
  
  getColumn(num: number, puzzle: Row[]) {
    const column = new Array<Cell>(puzzle.length);
    for(let i = 0; i < puzzle.length; i++) {
      column[i] = puzzle[i][num]
    }
    return column;
  }

  private bruteForceSolve(puzzle: Row[]) {
    const emptyCell = this.findEmptyCell(puzzle);
    if(!emptyCell) {
      return true
    }
    const potentialValues = [] as number[];
    for(let i = 1; i <= puzzle.length; i++) {
      potentialValues.push(i);
    }
    shuffleArray(potentialValues);
    for(const value of potentialValues) {
      if(this.numberWorksInCell(emptyCell.rowIndex, emptyCell.colIndex, value, puzzle)) {
        puzzle[emptyCell.rowIndex][emptyCell.colIndex].value = value;
        // Recursively fill puzzle
        if(this.bruteForceSolve(puzzle)) {
          return true;
        }
        // backtrack if the puzzle value leads to a un-solvable puzzle
        puzzle[emptyCell.rowIndex][emptyCell.colIndex].value = undefined;
      }
    }
    return false;
  }

  private _solve(puzzle: Row[], strategiesUsed: StrategiesUsed) {
    if(this.isPuzzleSolved(puzzle, false)) {
      return true;
    }
    let single = this.findSingle(puzzle);
    while(single) {
      puzzle[single.rowIndex][single.colIndex].value = single.value;
      this.removeCandidateInRow(single.value, single.rowIndex, puzzle);
      this.removeCandidateInCol(single.value, single.colIndex, puzzle);
      this.removeCandidateInBlock(single.value, this.calcBlockNum(single.rowIndex, single.colIndex, Math.sqrt(puzzle.length)), puzzle);
      strategiesUsed[single.type] ? strategiesUsed[single.type]++ : strategiesUsed[single.type] = 1;
      single = this.findSingle(puzzle);
    }
    if(this.findLockedCandidate(puzzle, strategiesUsed)) {
      this._solve(puzzle, strategiesUsed);
    }

    
    

  }
  private findSingle(puzzle: Row[]) {
    for(let rowIndex = 0; rowIndex < puzzle.length; rowIndex++) {
      for(let colIndex = 0; colIndex < puzzle.length; colIndex++) {
        const cell = puzzle[rowIndex][colIndex];
        if(cell.value) {
          continue;
        }
        if(cell.candidates.size === 1) {
          const singleType = this.isFullHouse(rowIndex, colIndex, puzzle) ? "fullHouses" : "nakedSingles";
          return {rowIndex: rowIndex, colIndex: colIndex, value: cell.candidates.values().next().value, type: singleType as Strategies}
        }
        const hiddenSingle = this.findHiddenSingle(rowIndex, colIndex, puzzle)
        if(hiddenSingle !== -1) {
          return { rowIndex, colIndex, value: hiddenSingle, type: 'hiddenSingles' as Strategies }
        }
      }
    }
    return undefined;
  }

  private isFullHouse(rowIndex: number, colIndex: number, puzzle: Row[]) {
    const blockWidth = Math.sqrt(puzzle.length);
    const rowValues = puzzle[rowIndex]
      .map((cell) => cell.value)
      .filter((each) => each !== undefined);
    const colValues = this.getColumn(colIndex, puzzle)
      .map((cell) => cell.value)
      .filter((each) => each !== undefined);

    const blockNum = this.calcBlockNum(rowIndex, colIndex, blockWidth)
    const blockValues = this.getBlock(blockNum, puzzle)
      .map((cell) => cell.value)
      .filter((each) => each !== undefined);

    if(rowValues.length === 8 || colValues.length === 8 || blockValues.length === 8) {
      return true;
    }
    return false;

  }
  private calcBlockNum(rowIndex: number, colIndex: number, blockWidth: number) {
    return (Math.floor(rowIndex / blockWidth) * blockWidth) + (colIndex % blockWidth)
  }
  private findHiddenSingle(rowIndex: number, colIndex: number, puzzle: Row[]) {
    const cell = puzzle[rowIndex][colIndex];
    const blockWidth = Math.sqrt(puzzle.length);
    const blockNum = this.calcBlockNum(rowIndex, colIndex, blockWidth);
    const candidateRow = puzzle[rowIndex].filter((eachCell) => eachCell.cellId !== cell.cellId).map((eachCell) => eachCell.candidates)
    const candidateCol = this.getColumn(colIndex, puzzle).filter((eachCell) => eachCell.cellId !== cell.cellId).map((eachCell) => eachCell.candidates)
    const candidateBlock = this.getBlock(blockNum, puzzle).filter((eachCell) => eachCell.cellId !== cell.cellId).map((eachCell) => eachCell.candidates)
    for(const candidate of cell.candidates) {
      let singleInRow = true;
      let singleInCol = true;
      let singleInBlock = true;
       for(const cellCandidates of candidateRow) {
        if(cellCandidates.has(candidate)) {
          singleInRow = false;
          break;
        }
      }
      for(const cellCandidates of candidateCol) {
        if(cellCandidates.has(candidate)) {
          singleInCol = false;
          break;
        }
      }
      for(const cellCandidates of candidateBlock) {
        if(cellCandidates.has(candidate)) {
          singleInBlock = false;
          break;
        }
      }
      if(singleInRow || singleInCol || singleInBlock) {
        return candidate;
      }
    }
    return -1;
  }

  private findLockedCandidate(puzzle: Row[], strategiesUsed: StrategiesUsed) {
    if(this.findLockedCandidatePointing(puzzle)) {
      strategiesUsed['lockedCandidatePointing'] ? strategiesUsed['lockedCandidatePointing']++ : strategiesUsed['lockedCandidatePointing'] = 1;
      return true;
    }
    if(this.findLockedCandidateClaiming(puzzle)) {
      strategiesUsed['lockedCandidateClaiming'] ? strategiesUsed['lockedCandidateClaiming']++ : strategiesUsed['lockedCandidateClaiming'] = 1;
      return true;
    }
    return false;
  }

  private findLockedCandidatePointing(puzzle: Row[]) {
    // For each block in the puzzle;
    for(let blockNum = 0; blockNum < puzzle.length; blockNum++ ){
      const blockWidth = Math.sqrt(puzzle.length);
      const startRow = Math.floor(blockNum / blockWidth) * blockWidth;
      const startCol = (blockNum % blockWidth) * blockWidth;
      // For every candidate
      for(let digit = 1; digit <= puzzle.length; digit++) {
        const digitLocations: {row: number, col: number}[] = [];
        // Get the locations of the digit in question in the block.
        for(let rowIndex = startRow; rowIndex < startRow + blockWidth; rowIndex++) {
          for(let colIndex = startCol; colIndex < startCol + blockWidth; colIndex++) {
            const cell = puzzle[rowIndex][colIndex];
            if(cell.value) {
              continue;
            }
            if(cell.candidates.has(digit)) {
              digitLocations.push({ row: rowIndex, col: colIndex})
            }
          }
        }
        // This should never happen but just in case.
        if(digitLocations.length < 2) continue;

        // If every digit location is in the same row.
        if(digitLocations.every((loc) => loc.row === digitLocations[0].row)) {
          let eliminationMade = false;
          for(let colIndex = 0; colIndex < puzzle.length; colIndex++ ){
            // if column is not in block
            if(Math.floor(colIndex / blockWidth) * blockWidth !== startCol) {
              const cell = puzzle[digitLocations[0].row][colIndex];
              if(cell.value) {
                continue;
              }
              if(cell.candidates.has(digit)) {
                cell.candidates.delete(digit);
                eliminationMade = true;
              }
            }
          }
          if(eliminationMade) {
            return true;
          }
        }
        // If every digit location is in the same column
        if(digitLocations.every((loc) => loc.col === digitLocations[0].col)) {
          let eliminationMade = false;
          for(let rowIndex = 0; rowIndex < puzzle.length; rowIndex++) {
            // If row is not in block;
            if(Math.floor(rowIndex / blockWidth) * blockWidth !== startRow) {
              const cell = puzzle[rowIndex][digitLocations[0].col];
              if(cell.value) {
                continue;
              }
              if(cell.candidates.has(digit)) {
                cell.candidates.delete(digit);
                eliminationMade = true;
              }
            }
          }
          if(eliminationMade) {
            return true;
          }
        }
      }
    }
    return false;
  }
  private findLockedCandidateClaiming(puzzle: Row[]) {
    const blockWidth = Math.sqrt(puzzle.length)
    for(let rowIndex = 0; rowIndex < puzzle.length; rowIndex++) {
      for(let digit = 1; digit <= puzzle.length; digit++) {
        const rowLocations = [] as number[];
        for(let colIndex = 0; colIndex < puzzle.length; colIndex++) {
          const cell = puzzle[rowIndex][colIndex];
          if(cell.value) {
            continue;
          }
          if(cell.candidates.has(digit)) {
            rowLocations.push(digit);
          }
        }
        if(rowLocations.length > 1 && rowLocations.length < 4) {
          // Checking to see if the block location of the first candidate in the row is the same as all the rest.
          const blockY = Math.floor(rowLocations[0] / blockWidth);
          if(rowLocations.every((colLoc) => Math.floor(colLoc / blockWidth) === blockY)) {
            let eliminationMade = false;
            const startRow = Math.floor(rowIndex / blockWidth) * blockWidth;
            const startCol = blockY * blockWidth;
            for(let cellRow = startRow; cellRow < startRow + blockWidth; cellRow++) {
              for(let celCol = startCol; celCol < startCol + blockWidth; celCol++) {
                if(cellRow !== rowIndex) {
                  const cell = puzzle[cellRow][celCol];
                  if(cell.value) {
                    continue;
                  }
                  if(cell.candidates.has(digit)) {
                    cell.candidates.delete(digit);
                    eliminationMade = true;
                  }
                }
              }
            }
            if(eliminationMade) {
              return true;
            }
          }
        }
      }
    }

    for(let colIndex = 0; colIndex < puzzle.length; colIndex++) {
      for(let digit = 1; digit <= puzzle.length; digit++) {
        const colLocations = [] as number[];
        for(let rowIndex = 0; rowIndex < puzzle.length; rowIndex++) {
          const cell = puzzle[rowIndex][colIndex];
          if(cell.value) {
            continue;
          }
          if(cell.candidates.has(digit)) {
            colLocations.push(digit)
          }
        }

        if(colLocations.length > 1 && colLocations.length < 4) {
          const blockX = Math.floor(colLocations[0] / blockWidth)
          if(colLocations.every((row) => Math.floor(row / blockWidth) === blockX)) {
            let eliminationMade = false;
            const startCol = Math.floor(colIndex / blockWidth) * blockWidth;
            const startRow = blockX * blockWidth
            for(let cellRow = startRow; cellRow < startRow + blockWidth; cellRow++) {
              for(let cellCol = startCol; cellCol < startCol + blockWidth; cellCol++) {
                if(cellCol !== colIndex) {
                  const cell = puzzle[cellRow][cellCol];
                  if(cell.value) {
                    continue;
                  }
                  if(cell.candidates.has(digit)) {
                    cell.candidates.delete(digit);
                    eliminationMade = true;
                  }
                }
              }
            }
            if(eliminationMade) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  private findHiddenSubsets(puzzle: Row[], strategiesUsed: StrategiesUsed) {
    // IN ROWS
    for(let rowIndex = 0; rowIndex < puzzle.length; rowIndex++) {
      const row = puzzle[rowIndex];

    }
  }
  private findNakedPair(puzzle: Row[], strategiesUsed: StrategiesUsed) {
    // In Rows
    for(let rowIndex = 0; rowIndex < puzzle.length; rowIndex++) {
      const nakedPairs = [] as Set<number>[]
      for(let colIndex = 0; colIndex < puzzle.length; colIndex++) {
        const cell = puzzle[rowIndex][colIndex]
        if(cell.value) {
          continue;
        }
        if(cell.candidates.size === 2) {
          nakedPairs.push(cell.candidates)
        }
      }
      if(nakedPairs.length > 2) {
        for(let i = 0; i < nakedPairs.length; i++) {
          const pair = nakedPairs[i];
          for(const pair2 of nakedPairs) {
            
          }
        }
      }

    }
  }
  private findEmptyCell(puzzle: Row[]) {
    for(let rowIndex = 0; rowIndex < puzzle.length; rowIndex++) {
      for(let colIndex = 0; colIndex < puzzle.length; colIndex++) {
        if(!puzzle[rowIndex][colIndex].value) {
          return {rowIndex, colIndex}
        }
      }
    }
    return null;
  }
  private removeCandidateInRow(value: number, rowIndex: number, puzzle: Row[]) {
    const row = puzzle[rowIndex];
    for(const cell of row) {
      cell.candidates.delete(value);
    }
  }
  private removeCandidateInCol(value: number, colIndex: number, puzzle: Row[]) {
    const col = this.getColumn(colIndex, puzzle);
    for(const cell of col) {
      cell.candidates.delete(value);
    }
  }
  private removeCandidateInBlock(value: number, blockNum: number, puzzle: Row[]) {
    const block = this.getBlock(blockNum, puzzle);
    for(const cell of block) {
      cell.candidates.delete(value)
    }
  }
  private validatePuzzle(puzzleRows?: Row[]) {
    if(!puzzleRows) {
      throw new PuzzleSolverError("Puzzle malformed: puzzle was undefined")
    }
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
