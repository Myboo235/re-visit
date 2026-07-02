CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default user admin/admin
-- In a real app, we would hash the password.
INSERT OR IGNORE INTO users (username, password) VALUES ('admin', 'admin');

-- Add metadata columns to bookmarks table
ALTER TABLE bookmarks ADD COLUMN description TEXT;
ALTER TABLE bookmarks ADD COLUMN favicon TEXT;
ALTER TABLE bookmarks ADD COLUMN thumbnail TEXT;
ALTER TABLE bookmarks ADD COLUMN shows_preview BOOLEAN DEFAULT 1;
