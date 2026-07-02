from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, RootModel


class BookmarkBase(BaseModel):
    url: str
    title: str
    tags: List[str] = Field(default_factory=list)
    folder: Optional[str] = None
    description: Optional[str] = None
    favicon: Optional[str] = None
    thumbnail: Optional[str] = None
    shows_preview: bool = True


class BookmarkCreate(BookmarkBase):
    pass


class BookmarkUpdate(BaseModel):
    url: Optional[str] = None
    title: Optional[str] = None
    tags: Optional[List[str]] = None
    folder: Optional[str] = None
    description: Optional[str] = None
    favicon: Optional[str] = None
    thumbnail: Optional[str] = None
    shows_preview: Optional[bool] = None


class BookmarkOut(BookmarkBase):
    id: str
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    model_config = {"populate_by_name": True}


class BookmarkPaginatedOut(BaseModel):
    items: List[BookmarkOut]
    total: int
    page: int
    page_size: int
    pages: int


class MetadataQuery(BaseModel):
    url: str


class MetadataOut(BaseModel):
    title: str
    description: str
    favicon: str
    thumbnail: str
    is_iframe_blocked: bool
    blocked_reason: str


class BookmarkOutList(RootModel):
    root: List[BookmarkOut]


class BookmarkStats(BaseModel):
    total: int
    folders: dict[str, int]
    tags: dict[str, int]


class Message(BaseModel):
    message: str
