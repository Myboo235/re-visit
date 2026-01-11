from typing import List, Optional

from revisit.core.utils import parse_indices
from revisit.db.sqlite.manager import DatabaseManager
from revisit.db.sqlite.repository import BookmarkRepository
from revisit.domain.bookmark import Bookmark


class BookmarkHandler:
    def __init__(self, db_manager: Optional[DatabaseManager] = None):
        self.db_manager = db_manager or DatabaseManager()
        self.repo = BookmarkRepository(self.db_manager)

    def add_bookmark(self, url: str, name: str, tags: List[str]) -> Bookmark:
        bookmark = Bookmark(url=url, name=name, tags=tags)
        return self.repo.add(bookmark)

    def list_bookmarks(self, indices: Optional[str] = None) -> List[Bookmark]:
        if indices:
            ids = list(parse_indices(indices))
            return self.repo.get_by_ids(ids)
        return self.repo.list_all()

    def delete_bookmarks(self, indices: str) -> List[int]:
        ids = list(parse_indices(indices))
        if ids:
            self.repo.delete(ids)
        return ids

    def update_bookmark(
        self,
        bookmark_id: int,
        url: Optional[str] = None,
        name: Optional[str] = None,
        tags: Optional[List[str]] = None,
    ) -> bool:
        bookmarks = self.repo.get_by_ids([bookmark_id])
        if not bookmarks:
            return False

        b = bookmarks[0]
        if url is not None:
            b.url = url
        if name is not None:
            b.name = name
        if tags is not None:
            b.tags = tags

        self.repo.update(b)
        return True

    def get_bookmark(self, bookmark_id: int) -> Optional[Bookmark]:
        bookmarks = self.repo.get_by_ids([bookmark_id])
        return bookmarks[0] if bookmarks else None
