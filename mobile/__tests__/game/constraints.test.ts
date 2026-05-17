import { cellHasError } from '@/game/cellHasError'
import { numberWorksInCell } from '@/game/numberWorksInCell'
import { at } from '@/game/board'
import { buildBlankCells } from '@/game/buildPuzzle'

describe('numberWorksInCell', () => {
  it('on a blank board, any 1..9 value works anywhere', () => {
    const cells = buildBlankCells()
    for (let v = 1; v <= 9; v++) {
      expect(numberWorksInCell(cells, at(4, 4), v)).toBe(true)
    }
  })

  it('rejects a value that already lives in the same row', () => {
    const cells = buildBlankCells()
    cells[at(0, 4)] = { ...cells[at(0, 4)], value: 7 }
    expect(numberWorksInCell(cells, at(5, 4), 7)).toBe(false)
    expect(numberWorksInCell(cells, at(5, 4), 8)).toBe(true)
  })

  it('rejects a value that already lives in the same column', () => {
    const cells = buildBlankCells()
    cells[at(4, 0)] = { ...cells[at(4, 0)], value: 3 }
    expect(numberWorksInCell(cells, at(4, 5), 3)).toBe(false)
    expect(numberWorksInCell(cells, at(4, 5), 4)).toBe(true)
  })

  it('rejects a value that already lives in the same block', () => {
    const cells = buildBlankCells()
    // (0,0) and (2,2) are in the same block.
    cells[at(0, 0)] = { ...cells[at(0, 0)], value: 9 }
    expect(numberWorksInCell(cells, at(2, 2), 9)).toBe(false)
    expect(numberWorksInCell(cells, at(2, 2), 1)).toBe(true)
  })

  it('returns true for value 0 or out-of-range (not a real placement)', () => {
    const cells = buildBlankCells()
    expect(numberWorksInCell(cells, at(0, 0), 0)).toBe(true)
    expect(numberWorksInCell(cells, at(0, 0), 10)).toBe(true)
  })
})

describe('cellHasError', () => {
  it('returns false for an empty cell', () => {
    const cells = buildBlankCells()
    expect(cellHasError(cells, at(4, 4))).toBe(false)
  })

  it('returns false on a real valid solved sudoku', () => {
    const VALID =
      '534678912672195348198342567' +
      '859761423426853791713924856' +
      '961537284287419635345286179'
    const cells = VALID.split('').map((d, idx) => ({
      idx,
      value: Number(d),
      candidates: [] as number[],
    }))
    for (let i = 0; i < cells.length; i++) {
      expect(cellHasError(cells, i)).toBe(false)
    }
  })

  it('returns true when a peer has the same value', () => {
    const cells = buildBlankCells()
    cells[at(0, 0)] = { ...cells[at(0, 0)], value: 5 }
    cells[at(0, 5)] = { ...cells[at(0, 5)], value: 5 } // same column
    expect(cellHasError(cells, at(0, 0))).toBe(true)
    expect(cellHasError(cells, at(0, 5))).toBe(true)
    // A non-peer cell with the same value isn't an error
    cells[at(5, 5)] = { ...cells[at(5, 5)], value: 9 }
    expect(cellHasError(cells, at(5, 5))).toBe(false)
  })

  it('returns false for an out-of-bounds idx', () => {
    const cells = buildBlankCells()
    expect(cellHasError(cells, -1)).toBe(false)
    expect(cellHasError(cells, 81)).toBe(false)
  })
})
