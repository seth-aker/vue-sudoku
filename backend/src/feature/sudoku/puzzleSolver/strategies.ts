export interface StrategiesUsed {
  fullHouses: number,
  nakedSingles: number,
  hiddenSingles: number,
  lockedCandidatePointing: number,
  lockedCandidateClaiming: number,
  hiddenPairs: number,
  hiddenTriples: number,
  nakedPairs: number,
  lockedPairs: number,
  nakedTriples: number,
  lockedTriples: number,
  nakedQuads: number,
  hiddenQuads: number,
  guess: number
}

export type Strategies = keyof StrategiesUsed
