export interface Difficulty {
  score?: number,
  rating: DifficultyRating
} 
export type DifficultyRating = 'beginner' | 'easy' | 'medium' | 'hard' | 'impossible';

