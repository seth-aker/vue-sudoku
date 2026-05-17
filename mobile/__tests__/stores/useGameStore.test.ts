/**
 * Tests for the unified game store. Verifies the action-grouping undo/redo
 * logic (parent action + auto-candidate child actions) and the basic
 * setCell / toggleCandidate / erase paths.
 */
import { useGameStore } from '@/stores/useGameStore'
import { buildBlankCells, deserializeCells } from '@/game'
import { at } from '@/game/board'
import type { Cells } from '@/types'

/** Reset the store to the initial blank state before each test. */
beforeEach(() => {
  useGameStore.getState().reset()
})

function seed(cells: Cells, originalCells: Cells = cells) {
  useGameStore.setState({
    puzzleId: 'test-puzzle',
    cells: cells.map((c) => ({ ...c, candidates: [...c.candidates] })),
    originalCells: originalCells.map((c) => ({ ...c, candidates: [...c.candidates] })),
    status: 'playing',
  })
}

describe('useGameStore — setCell', () => {
  it('places a value, clears its candidates, and pushes a parent action', () => {
    seed(buildBlankCells())
    useGameStore.getState().setCell(at(0, 0), 5)
    const s = useGameStore.getState()
    expect(s.cells[0].value).toBe(5)
    expect(s.cells[0].candidates).toEqual([])
    expect(s.actions).toHaveLength(1)
    expect(s.actions[0].isParent).toBe(true)
    expect(s.actions[0].prevCell.value).toBe(0)
  })

  it('no-ops on a prefilled cell', () => {
    // Pre-set original cells to have a clue at idx 0.
    const blank = buildBlankCells()
    const filled = blank.map((c, i) => (i === 0 ? { ...c, value: 7 } : c))
    seed(filled, filled)
    useGameStore.getState().setCell(0, 9)
    expect(useGameStore.getState().cells[0].value).toBe(7)
    expect(useGameStore.getState().actions).toHaveLength(0)
  })

  it('no-ops when the value is unchanged (does not pollute undo stack)', () => {
    const cells = buildBlankCells().map((c, i) => (i === 0 ? { ...c, value: 5 } : c))
    seed(cells, buildBlankCells())
    useGameStore.getState().setCell(0, 5)
    expect(useGameStore.getState().actions).toHaveLength(0)
  })

  it('clears redoActions whenever a new action is made', () => {
    seed(buildBlankCells())
    useGameStore.getState().setCell(at(0, 0), 5)
    useGameStore.getState().undo()
    expect(useGameStore.getState().redoActions.length).toBe(1)
    useGameStore.getState().setCell(at(0, 0), 7)
    expect(useGameStore.getState().redoActions.length).toBe(0)
  })

  it('autoCandidateMode strips the value from peer candidates as child actions', () => {
    // Seed every empty cell with candidates [1..9].
    const cells = buildBlankCells().map((c) => ({ ...c, candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9] }))
    seed(cells, buildBlankCells())
    useGameStore.setState({ autoCandidateMode: true })

    useGameStore.getState().setCell(at(4, 4), 5)

    const s = useGameStore.getState()
    // Target cell has value 5 and empty candidates.
    expect(s.cells[at(4, 4)].value).toBe(5)
    expect(s.cells[at(4, 4)].candidates).toEqual([])

    // A peer in the same row should no longer have 5 in candidates.
    expect(s.cells[at(0, 4)].candidates).not.toContain(5)
    // A non-peer should keep 5.
    expect(s.cells[at(0, 0)].candidates).toContain(5)

    // The action group has 1 parent + 20 children (one per peer).
    expect(s.actions[0].isParent).toBe(true)
    expect(s.actions.slice(1).every((a) => !a.isParent)).toBe(true)
    expect(s.actions.length).toBe(21)
  })
})

describe('useGameStore — toggleCandidate', () => {
  it('adds the candidate when absent, removes when present', () => {
    seed(buildBlankCells())
    useGameStore.getState().toggleCandidate(at(0, 0), 5)
    expect(useGameStore.getState().cells[0].candidates).toEqual([5])
    useGameStore.getState().toggleCandidate(at(0, 0), 5)
    expect(useGameStore.getState().cells[0].candidates).toEqual([])
  })

  it('keeps candidates sorted', () => {
    seed(buildBlankCells())
    useGameStore.getState().toggleCandidate(at(0, 0), 7)
    useGameStore.getState().toggleCandidate(at(0, 0), 3)
    useGameStore.getState().toggleCandidate(at(0, 0), 5)
    expect(useGameStore.getState().cells[0].candidates).toEqual([3, 5, 7])
  })

  it('refuses to pencil over a filled cell', () => {
    seed(buildBlankCells())
    useGameStore.getState().setCell(0, 5)
    useGameStore.getState().toggleCandidate(0, 3)
    expect(useGameStore.getState().cells[0].candidates).toEqual([])
  })
})

describe('useGameStore — undo / redo', () => {
  it('undo reverses a single setCell, restoring prior value', () => {
    seed(buildBlankCells())
    useGameStore.getState().setCell(at(0, 0), 5)
    useGameStore.getState().undo()
    const s = useGameStore.getState()
    expect(s.cells[0].value).toBe(0)
    expect(s.actions).toHaveLength(0)
    expect(s.redoActions).toHaveLength(1)
  })

  it('redo replays the move with the same final state', () => {
    seed(buildBlankCells())
    useGameStore.getState().setCell(at(0, 0), 5)
    useGameStore.getState().undo()
    useGameStore.getState().redo()
    const s = useGameStore.getState()
    expect(s.cells[0].value).toBe(5)
    expect(s.actions).toHaveLength(1)
    expect(s.redoActions).toHaveLength(0)
  })

  it('undo reverses an entire auto-candidate group in one click', () => {
    const cells = buildBlankCells().map((c) => ({ ...c, candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9] }))
    seed(cells, buildBlankCells())
    useGameStore.setState({ autoCandidateMode: true })
    useGameStore.getState().setCell(at(4, 4), 5)
    expect(useGameStore.getState().actions.length).toBe(21)

    useGameStore.getState().undo()

    const s = useGameStore.getState()
    expect(s.cells[at(4, 4)].value).toBe(0)
    // Every peer cell should have 5 back in candidates.
    expect(s.cells[at(0, 4)].candidates).toContain(5)
    expect(s.cells[at(4, 0)].candidates).toContain(5)
    expect(s.cells[at(2, 2)].candidates).toContain(5)
    // Action stack is empty; redo stack has all 21 entries.
    expect(s.actions).toHaveLength(0)
    expect(s.redoActions).toHaveLength(21)
  })

  it('redo re-applies an entire auto-candidate group', () => {
    const cells = buildBlankCells().map((c) => ({ ...c, candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9] }))
    seed(cells, buildBlankCells())
    useGameStore.setState({ autoCandidateMode: true })
    useGameStore.getState().setCell(at(4, 4), 5)
    useGameStore.getState().undo()
    useGameStore.getState().redo()

    const s = useGameStore.getState()
    expect(s.cells[at(4, 4)].value).toBe(5)
    expect(s.cells[at(0, 4)].candidates).not.toContain(5)
    expect(s.actions).toHaveLength(21)
    expect(s.redoActions).toHaveLength(0)
  })

  it('two undos walk back two separate moves correctly', () => {
    seed(buildBlankCells())
    useGameStore.getState().setCell(at(0, 0), 1)
    useGameStore.getState().setCell(at(8, 8), 9)
    useGameStore.getState().undo()
    expect(useGameStore.getState().cells[at(8, 8)].value).toBe(0)
    expect(useGameStore.getState().cells[at(0, 0)].value).toBe(1)
    useGameStore.getState().undo()
    expect(useGameStore.getState().cells[at(0, 0)].value).toBe(0)
  })

  it('undo on empty stack is a no-op', () => {
    seed(buildBlankCells())
    useGameStore.getState().undo()
    expect(useGameStore.getState().actions).toHaveLength(0)
    expect(useGameStore.getState().redoActions).toHaveLength(0)
  })
})

describe('useGameStore — resetPuzzle', () => {
  it('restores cells to originalCells and clears action stacks', () => {
    const blank = buildBlankCells()
    seed(blank)
    useGameStore.getState().setCell(at(0, 0), 5)
    useGameStore.getState().setCell(at(8, 8), 9)
    useGameStore.getState().resetPuzzle()

    const s = useGameStore.getState()
    expect(s.cells.every((c) => c.value === 0)).toBe(true)
    expect(s.actions).toHaveLength(0)
    expect(s.redoActions).toHaveLength(0)
  })
})

describe('useGameStore — solved detection', () => {
  it('isCompleted flips true when the final value completes a valid grid', () => {
    const VALID =
      '534678912' +
      '672195348' +
      '198342567' +
      '859761423' +
      '426853791' +
      '713924856' +
      '961537284' +
      '287419635' +
      '345286179'
    // Seed with one cell missing.
    const cellsWithHole = deserializeCells(VALID, VALID.slice(0, 80) + '0')
    // Hole is at idx 80, with original value 9; for the test we need originalCells
    // to mark idx 80 as a non-clue so it's editable.
    const original = deserializeCells(VALID.slice(0, 80) + '0')
    seed(cellsWithHole, original)

    useGameStore.getState().setCell(80, 9)
    const s = useGameStore.getState()
    expect(s.isCompleted).toBe(true)
    expect(s.status).toBe('solved')
  })
})
