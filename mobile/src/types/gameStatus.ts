/**
 * Game lifecycle state. The combined `useGameStore` exposes this and
 * components condition timer / pause-menu / solved-overlay rendering on it.
 */
export type GameStatus = 'not-started' | 'playing' | 'paused' | 'solved'
