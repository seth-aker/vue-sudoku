export interface Difficulty {
  score?: number,
  rating: DifficultyRating
} 
export type DifficultyRating = 'easy' | 'medium' | 'hard' | 'impossible';
export const difficultyScoreMin = {
  easy: 150,
  medium: 400,
  hard: 900,
  impossible: 5000
}
