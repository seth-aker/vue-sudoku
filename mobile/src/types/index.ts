export type { Cell, Cells } from './cell'
export type { Action } from './action'
export type { Difficulty, DifficultyRating } from './difficulty'
export type { GameStatus } from './gameStatus'

/** Standard sudoku board dimensions. Hardcoded to 9×9. */
export const BOARD_SIZE = 9
export const BLOCK_SIZE = 3
export const CELL_COUNT = BOARD_SIZE * BOARD_SIZE
