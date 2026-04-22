INSERT INTO puzzles (
  cells,
  difficulty_score,
  difficulty_rating
) VALUES (
  $cells,
  $difficultyScore, 
  $difficultyRating
) RETURNING puzzle_id