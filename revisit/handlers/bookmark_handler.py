from dataclasses import dataclass, field
from typing import List, Optional

from revisit.core.utils import parse_indices
from revisit.db.sqlite.manager import DatabaseManager
from revisit.db.sqlite.repository import BookmarkRepository
from revisit.domain.bookmark import Bookmark


@dataclass
class BookmarkParams:
    folder: Optional[str] = None
    description: Optional[str] = None
    favicon: Optional[str] = None
    thumbnail: Optional[str] = None
    shows_preview: Optional[bool] = True
    tags: Optional[List[str]] = field(default_factory=list)


class BookmarkHandler:
    def __init__(self, db_manager: Optional[DatabaseManager] = None):
        self.db_manager = db_manager or DatabaseManager()
        self.repo = BookmarkRepository(self.db_manager)

    def add_bookmark(
        self,
        url: str,
        name: str,
        params: Optional[BookmarkParams] = None,
    ) -> Bookmark:
        p = params or BookmarkParams()
        bookmark = Bookmark(
            url=url,
            name=name,
            tags=p.tags or [],
            folder=p.folder,
            description=p.description,
            favicon=p.favicon,
            thumbnail=p.thumbnail,
            shows_preview=p.shows_preview if p.shows_preview is not None else True,
        )
        return self.repo.add(bookmark)

    def list_bookmarks(self, indices: Optional[str] = None) -> List[Bookmark]:
        if indices:
            ids = list(parse_indices(indices))
            return self.repo.get_by_ids(ids)
        return self.repo.list_all()

    def list_bookmarks_paginated(
        self, page: int = 1, page_size: int = 50, search: Optional[str] = None
    ) -> dict:
        offset = (page - 1) * page_size
        bookmarks = self.repo.list_paginated(page_size, offset, search)
        total = self.repo.count_all(search)
        return {
            "items": bookmarks,
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": (total + page_size - 1) // page_size,
        }

    def get_stats(self) -> dict:
        return self.repo.get_stats()

    def delete_bookmarks(self, indices: str) -> List[int]:
        ids = list(parse_indices(indices))
        if ids:
            self.repo.delete(ids)
        return ids

    def update_bookmark(
        self,
        bookmark_id: int,
        params: Optional[BookmarkParams] = None,
        url: Optional[str] = None,
        name: Optional[str] = None,
    ) -> bool:
        bookmarks = self.repo.get_by_ids([bookmark_id])
        if not bookmarks:
            return False

        b = bookmarks[0]
        p = params or BookmarkParams()
        if url is not None:
            b.url = url
        if name is not None:
            b.name = name
        if p.tags is not None:
            b.tags = p.tags
        if p.folder is not None:
            b.folder = p.folder
        if p.description is not None:
            b.description = p.description
        if p.favicon is not None:
            b.favicon = p.favicon
        if p.thumbnail is not None:
            b.thumbnail = p.thumbnail
        if p.shows_preview is not None:
            b.shows_preview = p.shows_preview

        self.repo.update(b)
        return True

    def get_bookmark(self, bookmark_id: int) -> Optional[Bookmark]:
        bookmarks = self.repo.get_by_ids([bookmark_id])
        return bookmarks[0] if bookmarks else None

    def rename_folder(self, old_name: str, new_name: str) -> int:
        """Rename a folder by updating all bookmarks with the old folder name."""
        return self.repo.rename_folder(old_name, new_name)

    def delete_folder(self, name: str) -> int:
        """Delete a folder by setting folder to NULL for all bookmarks in it."""
        return self.repo.delete_folder(name)

    def rename_tag(self, old_name: str, new_name: str) -> int:
        """Rename a tag by updating all bookmarks containing the old tag."""
        return self.repo.rename_tag(old_name, new_name)

    def delete_tag(self, name: str) -> int:
        """Delete a tag by removing it from all bookmarks."""
        return self.repo.delete_tag(name)
