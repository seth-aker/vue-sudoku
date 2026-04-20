-- SQLite
CREATE TABLE IF NOT EXISTS user_puzzles (
  user_id INTEGER NOT NULL, 
  puzzle_id INTEGER NOT NULL,
  is_completed INTEGER DEFAULT FALSE,
  cells TEXT NOT NULL,
  candidates TEXT NOT NULL,
  time INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP -- TIMESTAMP
  completed_at TEXT DEFAULT NULL -- TIMESTAMP
  CONSTRAINT FK_user_id FOREIGN KEY (user_id) REFERENCES user (user_id),
  CONSTRAINT FK_puzzle_id FOREIGN KEY (puzzle_id) REFERENCES puzzle (puzzle_id),
  CONSTRAINT PK_user_id_puzzle_id PRIMARY KEY (user_id, puzzle_id)
);