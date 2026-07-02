from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional


@dataclass
class Bookmark:
    url: str
    name: str
    tags: List[str] = field(default_factory=list)
    id: Optional[int] = None
    folder: Optional[str] = None
    description: Optional[str] = None
    favicon: Optional[str] = None
    thumbnail: Optional[str] = None
    shows_preview: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    @classmethod
    def from_dict(cls, data: dict):
        tags = data.get("tags", "")
        if isinstance(tags, str):
            tags = [t.strip() for t in tags.split(",") if t.strip()]

        created_at = (
            datetime.fromisoformat(data["created_at"]) if data.get("created_at") else datetime.now()
        )
        updated_at = (
            datetime.fromisoformat(data["updated_at"]) if data.get("updated_at") else created_at
        )
        return cls(
            url=data["url"],
            name=data["name"],
            tags=tags,
            id=data.get("id"),
            folder=data.get("folder"),
            description=data.get("description"),
            favicon=data.get("favicon"),
            thumbnail=data.get("thumbnail"),
            shows_preview=bool(data.get("shows_preview", True)),
            created_at=created_at,
            updated_at=updated_at,
        )

    def to_dict(self):
        return {
            "id": self.id,
            "url": self.url,
            "name": self.name,
            "tags": ",".join(self.tags),
            "folder": self.folder,
            "description": self.description,
            "favicon": self.favicon,
            "thumbnail": self.thumbnail,
            "shows_preview": 1 if self.shows_preview else 0,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
