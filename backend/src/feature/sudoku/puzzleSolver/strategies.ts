export interface StrategiesUsed {
  fullHouses: number,
  nakedSingles: number,
  hiddenSingles: number,
  lockedCandidatePointing: number,
  lockedCandidateClaiming: number,
  hiddenPairs: number,
  hiddenTriples: number,
  nakedPairs: number,
  nakedTriples: number,
  nakedQuads: number,
  hiddenQuads: number,
  guess: number
}

export type Strategies = keyof StrategiesUsed

export const strategyScoreMap = {
  fullHouses: 1,
  nakedSingles: 5,
  hiddenSingles: 20,
  lockedCandidatePointing: 75,
  lockedCandidateClaiming: 75,
  nakedPairs: 150,
  hiddenPairs: 150,
  nakedTriples: 300,
  hiddenTriples: 500,
  nakedQuads: 1000,
  hiddenQuads: 1500,
  guess: 5000,
};
