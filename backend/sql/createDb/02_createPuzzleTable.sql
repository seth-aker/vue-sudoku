CREATE TABLE IF NOT EXISTS puzzle (
  puzzle_id INTEGER PRIMARY KEY,
  cells TEXT NOT NULL,
  difficulty_score INTEGER,
  difficulty_rating TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);