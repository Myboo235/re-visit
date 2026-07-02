from typing import List, Optional

from revisit.db.sqlite.manager import DatabaseManager
from revisit.domain.bookmark import Bookmark


class BookmarkRepository:
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager

    def add(self, bookmark: Bookmark) -> Bookmark:
        query = """
        INSERT INTO bookmarks
            (url, name, tags, folder, description,
             favicon, thumbnail, shows_preview, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        with self.db_manager.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                query,
                (
                    bookmark.url,
                    bookmark.name,
                    ",".join(bookmark.tags),
                    bookmark.folder,
                    bookmark.description,
                    bookmark.favicon,
                    bookmark.thumbnail,
                    1 if bookmark.shows_preview else 0,
                    bookmark.created_at.isoformat(),
                    bookmark.updated_at.isoformat(),
                ),
            )
            bookmark.id = cursor.lastrowid
            conn.commit()
        return bookmark

    def list_all(self) -> List[Bookmark]:
        query = "SELECT * FROM bookmarks ORDER BY updated_at DESC"
        bookmarks = []
        with self.db_manager.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query)
            rows = cursor.fetchall()
            for row in rows:
                bookmarks.append(Bookmark.from_dict(dict(row)))
        return bookmarks

    def list_paginated(
        self, limit: int, offset: int, search: Optional[str] = None
    ) -> List[Bookmark]:
        params = []
        where_clause = ""
        if search:
            where_clause = """
            WHERE name LIKE ? 
               OR url LIKE ? 
               OR description LIKE ? 
               OR tags LIKE ?
            """
            s = f"%{search}%"
            params.extend([s, s, s, s])

        query = f"SELECT * FROM bookmarks {where_clause} ORDER BY updated_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        bookmarks = []
        with self.db_manager.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
            for row in rows:
                bookmarks.append(Bookmark.from_dict(dict(row)))
        return bookmarks

    def count_all(self, search: Optional[str] = None) -> int:
        params = []
        where_clause = ""
        if search:
            where_clause = """
            WHERE name LIKE ? 
               OR url LIKE ? 
               OR description LIKE ? 
               OR tags LIKE ?
            """
            s = f"%{search}%"
            params.extend([s, s, s, s])

        query = f"SELECT COUNT(*) FROM bookmarks {where_clause}"
        with self.db_manager.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            return cursor.fetchone()[0]

    def get_by_ids(self, ids: List[int]) -> List[Bookmark]:
        if not ids:
            return []
        placeholders = ",".join(["?"] * len(ids))
        query = f"SELECT * FROM bookmarks WHERE id IN ({placeholders}) ORDER BY created_at DESC"
        bookmarks = []
        with self.db_manager.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, ids)
            rows = cursor.fetchall()
            for row in rows:
                bookmarks.append(Bookmark.from_dict(dict(row)))
        return bookmarks

    def delete(self, ids: List[int]):
        if not ids:
            return
        placeholders = ",".join(["?"] * len(ids))
        query = f"DELETE FROM bookmarks WHERE id IN ({placeholders})"
        with self.db_manager.get_connection() as conn:
            conn.execute(query, ids)
            conn.commit()

    def update(self, bookmark: Bookmark):
        query = """
        UPDATE bookmarks
        SET url = ?, name = ?, tags = ?, folder = ?,
            description = ?, favicon = ?, thumbnail = ?,
            shows_preview = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """
        with self.db_manager.get_connection() as conn:
            conn.execute(
                query,
                (
                    bookmark.url,
                    bookmark.name,
                    ",".join(bookmark.tags),
                    bookmark.folder,
                    bookmark.description,
                    bookmark.favicon,
                    bookmark.thumbnail,
                    1 if bookmark.shows_preview else 0,
                    bookmark.id,
                ),
            )
            conn.commit()

    def get_stats(self) -> dict:
        stats = {"total": 0, "folders": {}, "tags": {}}
        with self.db_manager.get_connection() as conn:
            cursor = conn.cursor()

            # Total
            cursor.execute("SELECT COUNT(*) FROM bookmarks")
            stats["total"] = cursor.fetchone()[0]

            # Folders
            cursor.execute("SELECT folder, COUNT(*) as count FROM bookmarks GROUP BY folder")
            for row in cursor.fetchall():
                folder = row["folder"] or "Unsorted"
                stats["folders"][folder] = row["count"]

            # Tags
            cursor.execute("SELECT tags FROM bookmarks WHERE tags IS NOT NULL AND tags != ''")
            for row in cursor.fetchall():
                tags = row["tags"].split(",")
                for tag in tags:
                    tag_name = tag.strip()
                    if tag_name:
                        stats["tags"][tag_name] = stats["tags"].get(tag_name, 0) + 1
        return stats

    def rename_folder(self, old_name: str, new_name: str) -> int:
        """Rename a folder by updating all bookmarks with the old folder name."""
        query = """
        UPDATE bookmarks 
        SET folder = ?, updated_at = CURRENT_TIMESTAMP
        WHERE folder = ?
        """
        with self.db_manager.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (new_name, old_name))
            conn.commit()
            return cursor.rowcount

    def delete_folder(self, name: str) -> int:
        """Delete a folder by setting folder to NULL for all bookmarks in it."""
        query = """
        UPDATE bookmarks 
        SET folder = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE folder = ?
        """
        with self.db_manager.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (name,))
            conn.commit()
            return cursor.rowcount

    def rename_tag(self, old_name: str, new_name: str) -> int:
        """Rename a tag by updating all bookmarks containing the old tag."""
        # SQLite doesn't have good string array support, so we need to fetch and update
        count = 0
        with self.db_manager.get_connection() as conn:
            cursor = conn.cursor()
            # Find all bookmarks with this tag
            cursor.execute("SELECT id, tags FROM bookmarks WHERE tags LIKE ?", (f"%{old_name}%",))
            rows = cursor.fetchall()

            for row in rows:
                tags = [t.strip() for t in row["tags"].split(",") if t.strip()]
                if old_name in tags:
                    # Replace the tag
                    new_tags = [new_name if t == old_name else t for t in tags]
                    cursor.execute(
                        "UPDATE bookmarks SET tags = ?, updated_at = CURRENT_TIMESTAMP"
                        " WHERE id = ?",
                        (",".join(new_tags), row["id"]),
                    )
                    count += 1
            conn.commit()
        return count

    def delete_tag(self, name: str) -> int:
        """Delete a tag by removing it from all bookmarks."""
        count = 0
        with self.db_manager.get_connection() as conn:
            cursor = conn.cursor()
            # Find all bookmarks with this tag
            cursor.execute("SELECT id, tags FROM bookmarks WHERE tags LIKE ?", (f"%{name}%",))
            rows = cursor.fetchall()

            for row in rows:
                tags = [t.strip() for t in row["tags"].split(",") if t.strip()]
                if name in tags:
                    # Remove the tag
                    new_tags = [t for t in tags if t != name]
                    cursor.execute(
                        "UPDATE bookmarks SET tags = ?, updated_at = CURRENT_TIMESTAMP"
                        " WHERE id = ?",
                        (",".join(new_tags), row["id"]),
                    )
                    count += 1
            conn.commit()
        return count
