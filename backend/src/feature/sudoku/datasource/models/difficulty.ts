export interface Difficulty {
  score?: number,
  rating: 'easy' | 'medium' | 'hard' | 'impossible';
} 
export const difficultyScoreMin = {
  easy: 200,
  medium: 500,
  hard: 5500,
  impossible: 25000
}
