from typing import List

from revisit.db.sqlite.manager import DatabaseManager
from revisit.domain.bookmark import Bookmark


class BookmarkRepository:
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager

    def add(self, bookmark: Bookmark) -> Bookmark:
        query = """
        INSERT INTO bookmarks (url, name, tags, created_at)
        VALUES (?, ?, ?, ?)
        """
        with self.db_manager.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                query,
                (
                    bookmark.url,
                    bookmark.name,
                    ",".join(bookmark.tags),
                    bookmark.created_at.isoformat(),
                ),
            )
            bookmark.id = cursor.lastrowid
            conn.commit()
        return bookmark

    def list_all(self) -> List[Bookmark]:
        query = "SELECT * FROM bookmarks ORDER BY id ASC"
        bookmarks = []
        with self.db_manager.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query)
            rows = cursor.fetchall()
            for row in rows:
                bookmarks.append(Bookmark.from_dict(dict(row)))
        return bookmarks

    def get_by_ids(self, ids: List[int]) -> List[Bookmark]:
        if not ids:
            return []
        placeholders = ",".join(["?"] * len(ids))
        query = f"SELECT * FROM bookmarks WHERE id IN ({placeholders}) ORDER BY id ASC"
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
        SET url = ?, name = ?, tags = ?
        WHERE id = ?
        """
        with self.db_manager.get_connection() as conn:
            conn.execute(query, (bookmark.url, bookmark.name, ",".join(bookmark.tags), bookmark.id))
            conn.commit()
