-- PGSQL
CREATE TABLE IF NOT EXISTS puzzles (
    puzzle_id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    cells TEXT NOT NULL,
    difficulty_score INTEGER,
    difficulty_rating TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
