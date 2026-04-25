-- pgSQL
CREATE TABLE IF NOT EXISTS user_puzzles (
    user_id UUID NOT NULL,
    puzzle_id UUID NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    cells TEXT NOT NULL,
    candidates TEXT,
    time INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, -- TIMESTAMP
    completed_at TIMESTAMPTZ DEFAULT NULL, -- TIMESTAMP
    CONSTRAINT FK_user_id FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT FK_puzzle_id FOREIGN KEY (puzzle_id) REFERENCES puzzles (puzzle_id),
    CONSTRAINT PK_user_id_puzzle_id PRIMARY KEY (user_id, puzzle_id)
);
