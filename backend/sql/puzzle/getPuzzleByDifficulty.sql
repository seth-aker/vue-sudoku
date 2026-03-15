SELECT 
  p.puzzle_id,
  p.cells,
  p.difficulty_score,
  p.difficulty_rating,
  p.createdAt,
  COUNT(*) OVER() as total_count
FROM puzzle p
WHERE p.difficulty_rating = $difficultyRating 
 AND (
    $userId IS NULL 
    OR 
    NOT EXISTS (
      SELECT 1 FROM user_puzzles up 
      WHERE up.puzzle_id = p.puzzle_id
        AND up.user_id = $userId
    )
  )
ORDER BY RANDOM()
LIMIT 1; 