import z from "zod/v4";
import { type Row } from "../datasource/models/row.ts";
import { PuzzleSolverError } from "../errors/puzzleSolverError.ts";
import { cellSchema } from "../middleware/validation/schema/cell.ts";
import { PuzzleSolver } from "./puzzleSolver.ts";
import { type Strategies, type StrategiesUsed } from "./strategies.ts";
import { type Cell } from "../datasource/models/cell.ts";
import { type Step } from "./step.ts";

export class PuzzleSolverImplementation implements PuzzleSolver {
  solvePuzzle(puzzle: Row[]) {
    this.validatePuzzle(puzzle);
    const initialPuzzle = structuredClone(puzzle);
    const steps = [] as Step[]
    this.fillPuzzleCandidates(puzzle);
    this._solve(puzzle, steps);
    const strategiesUsed = {} as StrategiesUsed
    steps.forEach((step) => {
      if(step.type) {
        strategiesUsed[step.type] ? strategiesUsed[step.type]++ : strategiesUsed[step.type] = 1
      }
    })
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
    const blockWidth = Math.sqrt(puzzle.length);
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

  private _solve(puzzle: Row[], steps: Step[]) {
    if(this.isPuzzleSolved(puzzle, false)) {
      return true;
    }
    let single = this.findSingle(puzzle);
    while(single) {
      steps.push({...single, candidateRemoved: false});
      puzzle[single.rowIndex][single.colIndex].value = single.value;
      const removedFromRow = this.removeCandidateInRow(single.value, single.rowIndex, puzzle);
      const removedFromCol = this.removeCandidateInCol(single.value, single.colIndex, puzzle);
      const removedFromBlock = this.removeCandidateInBlock(single.value, this.calcBlockNum(single.rowIndex, single.colIndex, puzzle), puzzle);
      removedFromRow.forEach((element) => steps.push({...element, candidateRemoved: true}))
      removedFromCol.forEach((element) => steps.push({...element, candidateRemoved: true}))
      removedFromBlock.forEach((element) => steps.push({...element, candidateRemoved: true}))
      single = this.findSingle(puzzle);
    }
    if(this.isPuzzleSolved(puzzle)) {
      return true;
    }
    if(this.findLockedCandidate(puzzle, steps)) {
      if(this._solve(puzzle, steps)) {
        return true;
      }
    }
    if(this.findSubsets(puzzle, steps)) {
      if(this._solve(puzzle, steps)){
        return true;
      }
    }
    // If the code gets here then we have to guess
    const emptyCell = this.findEmptyCell(puzzle);
    if(!emptyCell && this.isPuzzleSolved(puzzle)) {
      return true;
    }
    const cell = puzzle[emptyCell.rowIndex][emptyCell.colIndex];
    for(const value of cell.candidates) {
      // save the index of the last step made incase we need to backtrack.
      const lastStepIndex = steps.length - 1
      puzzle[emptyCell.rowIndex][emptyCell.colIndex].value = value;
      steps.push({rowIndex: emptyCell.rowIndex, colIndex: emptyCell.colIndex, type: 'guess', candidateRemoved: false, value})
      const candidatesRemoved = [] as {rowIndex: number, colIndex: number, value: number}[];
      candidatesRemoved.push(...this.removeCandidateInRow(value, emptyCell.rowIndex, puzzle));
      candidatesRemoved.push(...this.removeCandidateInCol(value, emptyCell.colIndex, puzzle));
      candidatesRemoved.push(...this.removeCandidateInBlock(value, this.calcBlockNum(emptyCell.rowIndex, emptyCell.colIndex, puzzle), puzzle));
      // Add each candidate removed as a step.
      candidatesRemoved.forEach((candidate) => steps.push({...candidate, candidateRemoved: true}))
      // Recursively attempt to solve the puzzle from here.
      if(this._solve(puzzle, steps)) {
        return true;
      }
      // backtrack if the puzzle value leads to a un-solvable puzzle
      // lastStepIndex + 1 because slice start index is inclusive
      const stepsToBacktrack = steps.slice(lastStepIndex + 1).reverse();
      for(const step of stepsToBacktrack) {
        if(step.candidateRemoved) {
          puzzle[step.rowIndex][step.colIndex].candidates.add(step.value);
        } else {
          puzzle[step.rowIndex][step.colIndex].value = null;
        }
      }
      // lastStepIndex + 1 because slice end index is exclusive
      steps = steps.slice(0, lastStepIndex + 1);
    }
    return false;
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
    const rowValues = puzzle[rowIndex]
      .map((cell) => cell.value)
      .filter((each) => each !== null);
    const colValues = this.getColumn(colIndex, puzzle)
      .map((cell) => cell.value)
      .filter((each) => each !== null);

    const blockNum = this.calcBlockNum(rowIndex, colIndex, puzzle)
    const blockValues = this.getBlock(blockNum, puzzle)
      .map((cell) => cell.value)
      .filter((each) => each !== null);

    if(rowValues.length === 8 || colValues.length === 8 || blockValues.length === 8) {
      return true;
    }
    return false;

  }
  private findHiddenSingle(rowIndex: number, colIndex: number, puzzle: Row[]) {
    const cell = puzzle[rowIndex][colIndex];
    const blockNum = this.calcBlockNum(rowIndex, colIndex, puzzle);
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

  private findLockedCandidate(puzzle: Row[], steps: Step[]) {
    if(this.findLockedCandidatePointing(puzzle, steps)) {
      return true;
    }
    if(this.findLockedCandidateClaiming(puzzle, steps)) {
      return true;
    }
    return false;
  }

  private findLockedCandidatePointing(puzzle: Row[], steps: Step[]) {
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
                steps.push({rowIndex: digitLocations[0].row, colIndex, type: 'lockedCandidatePointing', value: digit, candidateRemoved: true})
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
                steps.push({colIndex: digitLocations[0].col, rowIndex, type: 'lockedCandidatePointing', value: digit, candidateRemoved: true})
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
  private findLockedCandidateClaiming(puzzle: Row[], steps: Step[]) {
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
            rowLocations.push(colIndex);
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
            colLocations.push(rowIndex)
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

  private findSubsets(puzzle: Row[], steps: Step[]) {
    if(this.findNakedSubsetOfSize(puzzle, 2, steps)) {
      return true;
    }
    if(this.findNakedSubsetOfSize(puzzle, 3, steps)) {
      return true;
    }
    if(this.findNakedSubsetOfSize(puzzle, 4, steps)) {
      return true
    }
    if(this.findHiddenSubsetOfSize(puzzle, 2, steps)) {
      return true
    }
    if(this.findHiddenSubsetOfSize(puzzle, 3, steps)) {
      return true
    }
    if(this.findHiddenSubsetOfSize(puzzle, 4, steps)) {
      return true;
    }
    return false
  }
  private findNakedSubsetOfSize(puzzle: Row[], size: number, steps: Step[]) {
    for(let i = 0; i < puzzle.length; i++) {
      if(this.findAndEliminateNakedSubsetInHouse(puzzle[i], size, steps)) {
        return true;
      }
    }
    for(let i = 0; i < puzzle.length; i++) {
      if(this.findAndEliminateNakedSubsetInHouse(this.getColumn(i, puzzle), size, steps)) {
        return true;
      }
    }
    for(let i = 0; i < puzzle.length; i++) {
      if(this.findAndEliminateNakedSubsetInHouse(this.getBlock(i, puzzle), size, steps)) {
        return true;
      }
    }
  }
  private findAndEliminateNakedSubsetInHouse(house: Cell[], size: number, steps: Step[]) {
    let eliminationMade = false;
    const emptyCells = house.filter((cell) => !cell.value && cell.candidates.size > 1 && cell.candidates.size <= size);
    if(emptyCells.length < size) {
      return false;
    }
    const potentialSubsets = this.getCombinations(emptyCells, size);

    for(const subset of potentialSubsets) {
      const candidateUnion = new Set<number>();
      subset.forEach((cell) => {
        cell.candidates.forEach((candidate) => {
          candidateUnion.add(candidate)
        })
      })

      if(candidateUnion.size === size) {
        for(const cell of house) {
          if(subset.includes(cell)) {
            continue
          }
          for(const value of candidateUnion) {
            if(cell.candidates.delete(value)) {
              steps.push({
                rowIndex: Number.parseInt(cell.cellId.substring(1, cell.cellId.indexOf('c'))),
                colIndex: Number.parseInt(cell.cellId.substring((cell.cellId.indexOf('c') + 1))),
                type: size === 2 ? 'nakedPairs' : size === 3 ? 'nakedTriples' : 'nakedQuads',
                value: value,
                candidateRemoved: true
              })
              eliminationMade = true;
            }
          }
        }
      }
    }
    return eliminationMade;
  }
  private findHiddenSubsetOfSize(puzzle: Row[], size: number, steps: Step[]) {
    for(let i = 0; i < puzzle.length; i++) {
      if(this.findHiddenSubsetInHouse(puzzle[i], size, steps)) {
        return true;
      }
    }
    for(let i = 0; i < puzzle.length; i++) {
      if(this.findHiddenSubsetInHouse(this.getColumn(i, puzzle), size, steps)) {
        return true;
      }
    }
    for(let i = 0; i < puzzle.length; i++) {
      if(this.findHiddenSubsetInHouse(this.getBlock(i, puzzle), size, steps)) {
        return true
      }
    }
    return false;
  }
  private findHiddenSubsetInHouse(house: Cell[], size: number, steps: Step[]) {
    let eliminationMade = false;
    const allCandidates = new Set<number>();
    const emptyCells = [] as Cell[];
    for(const cell of house) {
      if(!cell.value) {
        emptyCells.push(cell);
        cell.candidates.forEach((value) => allCandidates.add(value))
      }
    }
    const potentialCombinations = this.getCombinations([...allCandidates], size);
    for(const potentialCombo of potentialCombinations) {
      const cellsWithCandidates = emptyCells.filter((cell) => potentialCombo.some((candidate) => cell.candidates.has(candidate)))

      if(cellsWithCandidates.length === size) {
        const appearsElsewhere = emptyCells.some((cell) => !cellsWithCandidates.includes(cell) && potentialCombo.some((value) => cell.candidates.has(value)))
        
        if(appearsElsewhere) {
          continue;
        }
        for(const cell of cellsWithCandidates) {
          const candidatesToRemove = [...cell.candidates].filter((value) => !potentialCombo.includes(value))
          candidatesToRemove.forEach((value) => {
            if(cell.candidates.delete(value)) {
              steps.push({
                rowIndex: Number.parseInt(cell.cellId.substring(1, cell.cellId.indexOf('c'))),
                colIndex: Number.parseInt(cell.cellId.substring((cell.cellId.indexOf('c') + 1))),
                type: size === 2 ? 'hiddenPairs' : size === 3 ? 'hiddenTriples' : 'hiddenQuads',
                value: value,
                candidateRemoved: true
              })
              eliminationMade = true;
            }
          })
        }
      }
      if(eliminationMade) {
        return true;
      }
    }
    return false;
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
    const candidatesRemoved = [] as {rowIndex: number, colIndex: number, value: number}[]
    for(let colIndex = 0; colIndex < puzzle.length; colIndex++) {
      const cell = puzzle[rowIndex][colIndex];
      if(cell.value) {
        continue;
      }
      if(cell.candidates.delete(value)) {
        candidatesRemoved.push({rowIndex, colIndex, value})
      }
    }
    return candidatesRemoved;
  }
  private removeCandidateInCol(value: number, colIndex: number, puzzle: Row[]) {
    const candidatesRemoved = [] as {rowIndex: number, colIndex: number, value: number}[]
    for(let rowIndex = 0; rowIndex < puzzle.length; rowIndex++) {
      const cell = puzzle[rowIndex][colIndex];
      if(cell.value) {
        continue;
      }
      if(cell.candidates.delete(value)) {
        candidatesRemoved.push({rowIndex, colIndex, value})
      }
    }
    return candidatesRemoved;
  }
  private removeCandidateInBlock(value: number, blockNum: number, puzzle: Row[]) {
    const blockWidth = Math.sqrt(puzzle.length);
    const xStartIndex = blockWidth * (blockNum % blockWidth)
    const yStartIndex = blockNum - (blockNum % blockWidth);
    const candidatesRemoved = [] as {rowIndex: number, colIndex: number, value: number}[]
    for(let rowIndex = yStartIndex; rowIndex < yStartIndex + blockWidth; rowIndex++) {
      for(let colIndex = xStartIndex; colIndex < xStartIndex + blockWidth; colIndex++) {
        const cell = puzzle[rowIndex][colIndex];
        if(cell.value) {
          continue
        }
        if(cell.candidates.delete(value)) {
          candidatesRemoved.push({rowIndex, colIndex, value})
        }
      }
    }
    return candidatesRemoved;
  }
  private getCombinations<T>(array: T[], size: number) {
    const result = [] as T[][];
    function combine(startIndex: number, currentCombo: T[]) {
      if(currentCombo.length === size) {
        result.push([...currentCombo])
      }
      for(let i = startIndex; i < array.length; i++) {
        currentCombo.push(array[i]);
        combine(i + 1, currentCombo);
        currentCombo.pop();
      }
    }
    combine(0, []);
    return result;
  }
  private calcBlockNum(rowIndex: number, colIndex: number, puzzle: Row[]) {
    const blockWidth = Math.sqrt(puzzle.length);
    const blockX = Math.floor(colIndex / blockWidth);
    const blockY = Math.floor(rowIndex / blockWidth);
    const blockNumber = blockX + (blockY * blockWidth);
    return blockNumber;
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
          throw new PuzzleSolverError(`Puzzle malformed: Cell validation error: ${z.prettifyError(res.error)}`)
        }
      }) 
    })
  }
}
