CREATE TABLE IF NOT EXISTS puzzles (
  puzzle_id INTEGER PRIMARY KEY,
  cells TEXT NOT NULL,
  difficulty_score INTEGER,
  difficulty_rating TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);