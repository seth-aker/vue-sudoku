-- SQLite
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    password_hash BLOB,
    salt BLOB,
    image_url TEXT,
    current_puzzle TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP, -- YYYY-MM-DDTHH-MM-SS
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP, -- YYYY-MM-DDTHH-MM-SS
    deleted_at TEXT DEFAULT NULL, -- YY-MM-DDTHH-MM-SS 
    CONSTRAINT FK_current_puzzle FOREIGN KEY (current_puzzle) REFERENCES puzzle (puzzle_id)
);
