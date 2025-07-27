export interface StrategiesUsed {
  fullHouses: number,
  nakedSingles: number,
  hiddenSingles: number,
  lockedPairsType1: number,
  lockedPairsType2: number,
  hiddenPairs: number,
  hiddenTriples: number,
  nakedPairs: number,
  lockedPairs: number,
  nakedTriples: number,
  lockedTriples: number
}

export type Strategies = keyof StrategiesUsed
