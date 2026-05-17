import {
  deserializeAction,
  deserializeCell,
  deserializeCells,
  serializeAction,
  serializeCandidatesToString,
  serializeCell,
  serializeCellsToString,
} from '@/game/serialization'
import { buildBlankCells, buildStandardCells } from '@/game/buildPuzzle'
import { BOARD_SIZE, CELL_COUNT } from '@/types'

describe('string format round-trip', () => {
  it('serializeCellsToString → deserializeCells preserves values', () => {
    const original = buildStandardCells()
    const str = serializeCellsToString(original)
    expect(str).toHaveLength(CELL_COUNT)
    expect(str).toMatch(/^[0-9]{81}$/)
    const round = deserializeCells(str)
    expect(round.map((c) => c.value)).toEqual(original.map((c) => c.value))
  })

  it('deserializeCells uses currentCellsStr over originalCellsStr when both present', () => {
    const orig = '1'.repeat(81)
    const curr = '2'.repeat(81)
    const cells = deserializeCells(orig, curr)
    cells.forEach((c) => expect(c.value).toBe(2))
  })

  it('deserializeCells falls back to original when current is omitted', () => {
    const orig = '7'.repeat(81)
    const cells = deserializeCells(orig)
    cells.forEach((c) => expect(c.value).toBe(7))
  })

  it('serializeCandidatesToString → deserializeCells preserves candidates', () => {
    const cells = buildBlankCells()
    // Sprinkle candidates on a few cells.
    cells[0] = { ...cells[0], candidates: [1, 2, 3] }
    cells[10] = { ...cells[10], candidates: [9] }
    cells[40] = { ...cells[40], candidates: [4, 5, 6, 7] }
    const candStr = serializeCandidatesToString(cells)
    expect(candStr.split(':')).toHaveLength(CELL_COUNT)

    const cellsStr = serializeCellsToString(cells)
    const round = deserializeCells(cellsStr, cellsStr, candStr)

    expect(round[0].candidates).toEqual([1, 2, 3])
    expect(round[10].candidates).toEqual([9])
    expect(round[40].candidates).toEqual([4, 5, 6, 7])
    expect(round[5].candidates).toEqual([])
  })

  it('deserializeCells gracefully handles garbage characters as 0', () => {
    const garbage = 'abc' + '0'.repeat(78)
    const cells = deserializeCells(garbage)
    expect(cells[0].value).toBe(0)
    expect(cells[1].value).toBe(0)
    expect(cells[2].value).toBe(0)
  })

  it('idx field on each cell matches its array position', () => {
    const cells = deserializeCells('0'.repeat(81))
    cells.forEach((c, i) => expect(c.idx).toBe(i))
  })
})

describe('numeric format — cells (20 bits)', () => {
  it('serializeCell → deserializeCell preserves idx, value, candidates', () => {
    const cell = { idx: 42, value: 7, candidates: [1, 3, 9] }
    const n = serializeCell(cell)
    expect(n).toBeLessThan(1 << 20)  // fits in 20 bits
    expect(deserializeCell(n)).toEqual(cell)
  })

  it('handles boundary values: idx 0, idx 80, value 0, value 9, empty candidates, full candidates', () => {
    const cases = [
      { idx: 0, value: 0, candidates: [] },
      { idx: 80, value: 9, candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
      { idx: 40, value: 5, candidates: [] },
      { idx: 5, value: 0, candidates: [9] },
    ]
    for (const cell of cases) {
      expect(deserializeCell(serializeCell(cell))).toEqual(cell)
    }
  })

  it('candidate order is canonical (ascending) regardless of input order', () => {
    const cell = { idx: 0, value: 0, candidates: [9, 1, 5, 3] }
    const back = deserializeCell(serializeCell(cell))
    expect(back.candidates).toEqual([1, 3, 5, 9])
  })

  it('serialized number uses exactly the documented bit layout', () => {
    // idx 0..6 (7 bits): mask 0x7f
    // value 7..10 (4 bits): mask 0xf << 7
    // candidates 11..19 (9 bits): mask 0x1ff << 11
    const n = serializeCell({ idx: 5, value: 3, candidates: [1, 9] })
    expect(n & 0x7f).toBe(5)
    expect((n >> 7) & 0xf).toBe(3)
    expect((n >> 11) & 0x1ff).toBe(0b100000001)  // bit 0 (1) and bit 8 (9)
  })
})

describe('numeric format — actions (21 bits)', () => {
  it('serializeAction → deserializeAction preserves isParent + prevCell', () => {
    const parent = {
      prevCell: { idx: 12, value: 4, candidates: [2, 6] },
      isParent: true,
    }
    const child = {
      prevCell: { idx: 12, value: 0, candidates: [] },
      isParent: false,
    }
    expect(deserializeAction(serializeAction(parent))).toEqual(parent)
    expect(deserializeAction(serializeAction(child))).toEqual(child)
  })

  it('isParent bit lives at position 20, leaving the lower 20 bits to the cell', () => {
    const action = {
      prevCell: { idx: 0, value: 0, candidates: [] },
      isParent: true,
    }
    const n = serializeAction(action)
    expect(n).toBe(1 << 20)
  })

  it('actions encode within 21 bits', () => {
    const action = {
      prevCell: { idx: 80, value: 9, candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
      isParent: true,
    }
    const n = serializeAction(action)
    expect(n).toBeLessThan(1 << 21)
  })
})

describe('boundary inputs are robust', () => {
  it('candidates outside 1..9 are filtered out on parse', () => {
    const stuffed = '12abc89:' + ':'.repeat(80)
    const cells = deserializeCells('0'.repeat(81), '0'.repeat(81), stuffed)
    expect(cells[0].candidates).toEqual([1, 2, 8, 9])
  })

  it('short cell string pads with zeros (no out-of-bounds)', () => {
    const cells = deserializeCells('12345')
    expect(cells).toHaveLength(CELL_COUNT)
    expect(cells[0].value).toBe(1)
    expect(cells[4].value).toBe(5)
    expect(cells[80].value).toBe(0)
  })

  it('BOARD_SIZE constant matches expectations', () => {
    expect(BOARD_SIZE).toBe(9)
  })
})
