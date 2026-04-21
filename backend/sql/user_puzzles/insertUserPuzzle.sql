-- SQLite
INSERT INTO
    user_puzzles (
        user_id,
        puzzle_id,
        is_completed,
        cells,
        candidates
    )
VALUES (
        $userId,
        $puzzleId,
        $isCompleted,
        $cells,
        $candidates
    );
