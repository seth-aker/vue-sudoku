/**
 * Difficulty rating. Backend stores `difficulty_rating` (text) + `difficulty_score` (number)
 * separately; the wire format on `SudokuPuzzle.difficulty` packs both.
 *
 * `hard` / `impossible` are valid backend values but the mobile app does not
 * expose routes for them yet (mirroring the web app's current state).
 */
export type DifficultyRating = 'beginner' | 'easy' | 'medium' | 'hard' | 'impossible'

export interface Difficulty {
  rating: DifficultyRating
  score?: number
}
