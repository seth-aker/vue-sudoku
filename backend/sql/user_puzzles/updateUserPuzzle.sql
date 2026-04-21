UPDATE user_puzzles
SET
    is_completed = $isCompleted,
    cells = $cells,
    candidates = $candidates,
    time = $time
WHERE
    user_id = $userId
    AND puzzle_id = $puzzleId;
