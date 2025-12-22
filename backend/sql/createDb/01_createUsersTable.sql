-- SQLite
CREATE TABLE IF NOT EXISTS user (
  user_id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  image_url TEXT,
  current_puzzle TEXT,
  password_hash TEXT NOT NULL,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,  -- YYYY-MM-DDTHH-MM-SS
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP, -- YYYY-MM-DDTHH-MM-SS
  isDeleted INTEGER DEFAULT FALSE,
  CONSTRAINT FK_current_puzzle FOREIGN KEY (current_puzzle) REFERENCES puzzle (puzzle_id)
);


