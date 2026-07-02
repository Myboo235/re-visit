ALTER TABLE bookmarks ADD COLUMN updated_at TIMESTAMP;
UPDATE bookmarks SET updated_at = created_at WHERE updated_at IS NULL;
