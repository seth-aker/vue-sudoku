import {
  at,
  blockOf,
  cellStatus,
  colOf,
  computeCandidates,
  getBlock,
  getColumn,
  getRow,
  hasAnyError,
  isSolved,
  isValidIdx,
  peerIndicesOf,
  rowOf,
} from '@/game/board'
import { buildBlankCells, buildStandardCells } from '@/game/buildPuzzle'
import { BOARD_SIZE } from '@/types'

describe('coordinate conversions', () => {
  it('at()/rowOf()/colOf() round-trip', () => {
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const idx = at(x, y)
        expect(rowOf(idx)).toBe(y)
        expect(colOf(idx)).toBe(x)
      }
    }
  })

  it('blockOf() maps the 9 corners + center correctly', () => {
    expect(blockOf(at(0, 0))).toBe(0)     // top-left
    expect(blockOf(at(8, 0))).toBe(2)     // top-right
    expect(blockOf(at(0, 8))).toBe(6)     // bottom-left
    expect(blockOf(at(8, 8))).toBe(8)     // bottom-right
    expect(blockOf(at(4, 4))).toBe(4)     // center
    expect(blockOf(at(3, 3))).toBe(4)     // center top-left
    expect(blockOf(at(2, 2))).toBe(0)
    expect(blockOf(at(5, 2))).toBe(1)
  })

  it('isValidIdx() rejects out-of-range / non-integer / negative', () => {
    expect(isValidIdx(0)).toBe(true)
    expect(isValidIdx(80)).toBe(true)
    expect(isValidIdx(-1)).toBe(false)
    expect(isValidIdx(81)).toBe(false)
    expect(isValidIdx(1.5)).toBe(false)
  })
})

describe('group accessors', () => {
  const cells = buildStandardCells()

  it('getRow returns 9 cells in row order, values match (row+col)%9+1', () => {
    for (let r = 0; r < BOARD_SIZE; r++) {
      const row = getRow(cells, r)
      expect(row).toHaveLength(BOARD_SIZE)
      for (let c = 0; c < BOARD_SIZE; c++) {
        expect(row[c].value).toBe(((r + c) % 9) + 1)
      }
    }
  })

  it('getColumn returns 9 cells in column order', () => {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const col = getColumn(cells, c)
      expect(col).toHaveLength(BOARD_SIZE)
      for (let r = 0; r < BOARD_SIZE; r++) {
        expect(col[r].value).toBe(((r + c) % 9) + 1)
      }
    }
  })

  it('getBlock(0) returns the top-left block in left-to-right, top-to-bottom order', () => {
    // Top-left block contains rows 0..2, cols 0..2.
    // For standard cells, value = (r+c)%9 + 1, so:
    //   (0,0)=1 (0,1)=2 (0,2)=3
    //   (1,0)=2 (1,1)=3 (1,2)=4
    //   (2,0)=3 (2,1)=4 (2,2)=5
    expect(getBlock(cells, 0).map((c) => c.value)).toEqual([1, 2, 3, 2, 3, 4, 3, 4, 5])
  })

  it('getBlock(4) returns the center block correctly', () => {
    // Center block rows 3..5, cols 3..5: values 7,8,9 / 8,9,1 / 9,1,2
    expect(getBlock(cells, 4).map((c) => c.value)).toEqual([7, 8, 9, 8, 9, 1, 9, 1, 2])
  })

  it('getBlock(8) returns the bottom-right block correctly', () => {
    expect(getBlock(cells, 8).map((c) => c.value)).toEqual([4, 5, 6, 5, 6, 7, 6, 7, 8])
  })

  it('out-of-range row/col/block returns empty array', () => {
    expect(getRow(cells, -1)).toEqual([])
    expect(getRow(cells, 9)).toEqual([])
    expect(getColumn(cells, -1)).toEqual([])
    expect(getColumn(cells, 9)).toEqual([])
    expect(getBlock(cells, -1)).toEqual([])
    expect(getBlock(cells, 9)).toEqual([])
  })
})

describe('peerIndicesOf', () => {
  it('returns exactly 20 distinct indices, not including self', () => {
    const peers = peerIndicesOf(at(4, 4))
    expect(peers).toHaveLength(20)
    expect(peers).not.toContain(at(4, 4))
    expect(new Set(peers).size).toBe(20)
  })

  it('peers of (0,0) include (0,8), (8,0), (2,2), but not (3,3)', () => {
    const peers = peerIndicesOf(at(0, 0))
    expect(peers).toContain(at(0, 8))  // same column
    expect(peers).toContain(at(8, 0))  // same row
    expect(peers).toContain(at(2, 2))  // same block
    expect(peers).not.toContain(at(3, 3))
  })
})

describe('hasAnyError / isSolved', () => {
  // A real valid 9x9 sudoku solution. `buildStandardCells()` produces a
  // Latin square but violates the block constraint, so we use this for
  // "no errors / solved" assertions.
  const VALID_SOLUTION =
    '534678912' +
    '672195348' +
    '198342567' +
    '859761423' +
    '426853791' +
    '713924856' +
    '961537284' +
    '287419635' +
    '345286179'

  function validSolvedCells() {
    return VALID_SOLUTION.split('').map((d, idx) => ({
      idx,
      value: Number(d),
      candidates: [] as number[],
    }))
  }

  it('a real valid solved sudoku has no errors and is solved', () => {
    const cells = validSolvedCells()
    expect(hasAnyError(cells)).toBe(false)
    expect(isSolved(cells)).toBe(true)
  })

  it('buildStandardCells() has block-level conflicts (Latin square only, not a valid sudoku)', () => {
    // Documenting the actual behavior: the (row+col)%9+1 pattern is a row/col
    // permutation but has block duplicates. This test pins that expectation.
    const cells = buildStandardCells()
    expect(hasAnyError(cells)).toBe(true)
    expect(isSolved(cells)).toBe(false)
  })

  it('blank board has no errors but is not solved', () => {
    const cells = buildBlankCells()
    expect(hasAnyError(cells)).toBe(false)
    expect(isSolved(cells)).toBe(false)
  })

  it('introducing a peer conflict in an otherwise valid solution trips hasAnyError', () => {
    const cells = validSolvedCells()
    expect(hasAnyError(cells)).toBe(false)
    // Overwrite (0,0) with the value at (1,0), guaranteeing a row-peer conflict.
    cells[at(0, 0)] = { ...cells[at(0, 0)], value: cells[at(1, 0)].value }
    expect(hasAnyError(cells)).toBe(true)
    expect(isSolved(cells)).toBe(false)
  })
})

describe('cellStatus', () => {
  it('returns "prefilled" when the original cell had a value', () => {
    const original = { idx: 0, value: 5, candidates: [] }
    const current = { idx: 0, value: 5, candidates: [] }
    expect(cellStatus(current, original)).toBe('prefilled')
  })

  it('returns "edited" when the original was empty and current has a value', () => {
    const original = { idx: 0, value: 0, candidates: [] }
    const current = { idx: 0, value: 7, candidates: [] }
    expect(cellStatus(current, original)).toBe('edited')
  })

  it('returns "blank" when both are empty', () => {
    const original = { idx: 0, value: 0, candidates: [] }
    const current = { idx: 0, value: 0, candidates: [] }
    expect(cellStatus(current, original)).toBe('blank')
  })
})

describe('computeCandidates', () => {
  it('for a blank board, every cell has candidates [1..9]', () => {
    const cells = buildBlankCells()
    const next = computeCandidates(cells)
    next.forEach((cell) => {
      expect(cell.candidates).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  it('a filled cell keeps its own (empty) candidates, peers exclude its value', () => {
    const cells = buildBlankCells()
    // Place a 5 at (0,0).
    cells[0] = { ...cells[0], value: 5 }
    const next = computeCandidates(cells)

    expect(next[0].value).toBe(5)
    expect(next[0].candidates).toEqual([])  // filled cell: candidates unchanged from input (empty)

    // (0,1) is a peer (same row). Its candidates should not include 5.
    expect(next[at(1, 0)].candidates).not.toContain(5)
    expect(next[at(1, 0)].candidates).toContain(4)
    expect(next[at(1, 0)].candidates).toContain(6)
  })

  it('does not mutate the input array', () => {
    const cells = buildBlankCells()
    const before = JSON.stringify(cells)
    computeCandidates(cells)
    expect(JSON.stringify(cells)).toBe(before)
  })
})
