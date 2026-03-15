-- SQLite
INSERT INTO user_puzzles (
  user_id,
  puzzle_id,
  isCompleted,
  cells,
  candidates
) VALUES (
  $userId,
  $puzzleId,
  $isCompleted,
  $cells,
  $candidates
);