export {
  // coordinate conversions
  rowOf,
  colOf,
  blockOf,
  at,
  isValidIdx,
  peerIndicesOf,
  // group accessors
  getRow,
  getColumn,
  getBlock,
  // status / validation
  cellStatus,
  isSolved,
  hasAnyError,
  computeCandidates,
  clearAllCandidates,
  type CellStatus,
} from './board'

export { buildBlankCells, buildStandardCells } from './buildPuzzle'
export { numberWorksInCell } from './numberWorksInCell'
export { cellHasError } from './cellHasError'

export {
  deserializeCells,
  serializeCellsToString,
  serializeCandidatesToString,
  serializeCell,
  deserializeCell,
  serializeAction,
  deserializeAction,
} from './serialization'
