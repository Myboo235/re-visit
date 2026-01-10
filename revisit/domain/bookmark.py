from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional

@dataclass
class Bookmark:
    url: str
    name: str
    tags: List[str] = field(default_factory=list)
    id: Optional[int] = None
    created_at: datetime = field(default_factory=datetime.now)

    @classmethod
    def from_dict(cls, data: dict):
        tags = data.get("tags", "")
        if isinstance(tags, str):
            tags = [t.strip() for t in tags.split(",") if t.strip()]
        
        return cls(
            url=data["url"],
            name=data["name"],
            tags=tags,
            id=data.get("id"),
            created_at=datetime.fromisoformat(data["created_at"]) if data.get("created_at") else datetime.now()
        )

    def to_dict(self):
        return {
            "id": self.id,
            "url": self.url,
            "name": self.name,
            "tags": ",".join(self.tags),
            "created_at": self.created_at.isoformat()
        }
