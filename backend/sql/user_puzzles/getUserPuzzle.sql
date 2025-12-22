SELECT 
  p.puzzle_id,
  up.isCompleted,
  up.cells as current_cells,
  up.candidates as current_candidates,
  up.time,
  p.cells as original_cells,
  p.difficulty_rating,
  p.difficulty_score
FROM user_puzzles as up
JOIN puzzle as p ON p.puzzle_id = up.puzzle_id
WHERE up.user_id = $userId AND up.puzzle_id = $puzzleId;