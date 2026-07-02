import os
import secrets
from datetime import timedelta
from typing import Optional

import click
from flask import Response, send_from_directory, session
from flask_openapi3 import FileStorage, Info, OpenAPI, Tag
from pydantic import BaseModel, Field

from revisit.core.metadata import fetch_metadata
from revisit.domain.schemas import (
    BookmarkCreate,
    BookmarkOut,
    BookmarkPaginatedOut,
    BookmarkStats,
    BookmarkUpdate,
    Message,
    MetadataOut,
    MetadataQuery,
)
from revisit.handlers.bookmark_handler import BookmarkHandler, BookmarkParams
from revisit.handlers.io_handler import IOHandler


def _bookmark_to_dict(b) -> dict:
    return {
        "id": str(b.id),
        "title": b.name,
        "url": b.url,
        "tags": b.tags,
        "folder": b.folder,
        "description": b.description,
        "favicon": b.favicon,
        "thumbnail": b.thumbnail,
        "shows_preview": b.shows_preview,
        "createdAt": b.created_at,
        "updatedAt": b.updated_at,
    }


def _register_auth_routes(app, auth_tag):
    class LoginBody(BaseModel):
        username: str
        password: str

    @app.post("/api/auth/login", tags=[auth_tag], responses={"200": Message, "401": Message})
    def login(body: LoginBody):
        """Login and create session"""
        if body.username == "admin" and body.password == "admin":
            session.permanent = True
            session["user"] = body.username
            session["logged_in"] = True
            return {"message": "success"}
        return {"message": "unauthorized"}, 401

    @app.post("/api/auth/logout", tags=[auth_tag], responses={"200": Message})
    def logout():
        """Logout and clear session"""
        session.clear()
        return {"message": "success"}

    @app.get("/api/auth/me", tags=[auth_tag], responses={"200": Message, "401": Message})
    def get_current_user():
        """Get current logged in user from session"""
        if session.get("logged_in"):
            return {"message": session.get("user", "unknown")}
        return {"message": "not logged in"}, 401


def _register_bookmark_routes(app, bh, bookmark_tag, util_tag):
    class BookmarkQuery(BaseModel):
        page: int = Field(1, description="Page number")
        page_size: int = Field(50, description="Page size")
        search: Optional[str] = Field(None, description="Search query")

    class BookmarkIdPath(BaseModel):
        bookmark_id: int

    class FileInput(BaseModel):
        file: FileStorage

    @app.post("/api/metadata", tags=[util_tag], responses={"200": MetadataOut})
    def get_metadata(body: MetadataQuery):
        """Fetch metadata for a URL"""
        return fetch_metadata(body.url)

    @app.get("/api/bookmarks", tags=[bookmark_tag], responses={"200": BookmarkPaginatedOut})
    def get_bookmarks(query: BookmarkQuery):
        """List bookmarks with pagination and search"""
        result = bh.list_bookmarks_paginated(
            page=query.page, page_size=query.page_size, search=query.search
        )
        return {
            "items": [_bookmark_to_dict(b) for b in result["items"]],
            "total": result["total"],
            "page": result["page"],
            "page_size": result["page_size"],
            "pages": result["pages"],
        }

    @app.post("/api/bookmarks", tags=[bookmark_tag], responses={"201": BookmarkOut})
    def add_bookmark(body: BookmarkCreate):
        """Add a new bookmark"""
        b = bh.add_bookmark(
            url=body.url,
            name=body.title,
            params=BookmarkParams(
                tags=body.tags,
                folder=body.folder,
                description=body.description,
                favicon=body.favicon,
                thumbnail=body.thumbnail,
                shows_preview=body.shows_preview,
            ),
        )
        return _bookmark_to_dict(b), 201

    @app.put(
        "/api/bookmarks/<int:bookmark_id>",
        tags=[bookmark_tag],
        responses={"200": Message, "404": Message},
    )
    def update_bookmark_api(path: BookmarkIdPath, body: BookmarkUpdate):
        """Update an existing bookmark"""
        ok = bh.update_bookmark(
            path.bookmark_id,
            url=body.url,
            name=body.title,
            params=BookmarkParams(
                tags=body.tags,
                folder=body.folder,
                description=body.description,
                favicon=body.favicon,
                thumbnail=body.thumbnail,
                shows_preview=body.shows_preview,
            ),
        )
        if not ok:
            return {"message": "Not found"}, 404
        return {"message": "success"}

    @app.delete("/api/bookmarks/<int:bookmark_id>", tags=[bookmark_tag], responses={"200": Message})
    def delete_bookmark_api(path: BookmarkIdPath):
        """Delete a bookmark"""
        bh.delete_bookmarks(str(path.bookmark_id))
        return {"message": "success"}

    @app.get("/api/bookmarks/stats", tags=[bookmark_tag], responses={"200": BookmarkStats})
    def get_stats():
        """Get bookmark statistics (total, folders, tags)"""
        return bh.get_stats()

    @app.get("/api/bookmarks/export", tags=[bookmark_tag], responses={"200": Message})
    def export_bookmarks():
        """Export bookmarks to HTML"""
        io = IOHandler(bh)
        html = io.generate_html()
        return Response(
            html,
            mimetype="text/html",
            headers={"Content-disposition": "attachment; filename=bookmarks.html"},
        )

    @app.post("/api/bookmarks/import", tags=[bookmark_tag], responses={"200": Message})
    def import_bookmarks(form: FileInput):
        """Import bookmarks from HTML"""
        io = IOHandler(bh)
        content = form.file.read().decode("utf-8", errors="ignore")
        count = io.import_from_string(content)
        return {"message": f"Successfully imported {count} bookmarks"}


def _register_folder_routes(app, bh):
    folder_tag = Tag(name="folder", description="Folder operations")

    class FolderRename(BaseModel):
        old_name: str
        new_name: str

    class FolderDelete(BaseModel):
        name: str

    @app.get("/api/folders", tags=[folder_tag], responses={"200": Message})
    def list_folders():
        """List all folders with counts"""
        stats = bh.get_stats()
        return {"folders": stats.get("folders", {})}

    @app.post("/api/folders/rename", tags=[folder_tag], responses={"200": Message})
    def rename_folder(body: FolderRename):
        """Rename a folder (updates all bookmarks with old folder name)"""
        count = bh.rename_folder(body.old_name, body.new_name)
        return {"message": f"Renamed folder, updated {count} bookmarks"}

    @app.post("/api/folders/delete", tags=[folder_tag], responses={"200": Message})
    def delete_folder(body: FolderDelete):
        """Delete a folder (sets folder to null for all bookmarks in it)"""
        count = bh.delete_folder(body.name)
        return {"message": f"Deleted folder, updated {count} bookmarks"}


def _register_tag_routes(app, bh):
    tag_mgmt_tag = Tag(name="tag", description="Tag operations")

    class TagRename(BaseModel):
        old_name: str
        new_name: str

    class TagDelete(BaseModel):
        name: str

    @app.get("/api/tags", tags=[tag_mgmt_tag], responses={"200": Message})
    def list_tags():
        """List all tags with counts"""
        stats = bh.get_stats()
        return {"tags": stats.get("tags", {})}

    @app.post("/api/tags/rename", tags=[tag_mgmt_tag], responses={"200": Message})
    def rename_tag(body: TagRename):
        """Rename a tag (updates all bookmarks with old tag name)"""
        count = bh.rename_tag(body.old_name, body.new_name)
        return {"message": f"Renamed tag, updated {count} bookmarks"}

    @app.post("/api/tags/delete", tags=[tag_mgmt_tag], responses={"200": Message})
    def delete_tag(body: TagDelete):
        """Delete a tag (removes tag from all bookmarks)"""
        count = bh.delete_tag(body.name)
        return {"message": f"Deleted tag, updated {count} bookmarks"}


def create_app():
    dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "web_dist"))

    info = Info(title="Revisit API", version="0.1.0")
    app = OpenAPI(__name__, info=info, static_folder=dist_dir)

    app.secret_key = os.environ.get("SECRET_KEY", secrets.token_hex(32))
    app.config["SESSION_COOKIE_NAME"] = "revisit_session"
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=365)

    bh = BookmarkHandler()

    bookmark_tag = Tag(name="bookmark", description="Bookmark operations")
    util_tag = Tag(name="utility", description="Utility operations")
    auth_tag = Tag(name="auth", description="Auth operations")

    _register_auth_routes(app, auth_tag)
    _register_bookmark_routes(app, bh, bookmark_tag, util_tag)
    _register_folder_routes(app, bh)
    _register_tag_routes(app, bh)

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def catch_all(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, "index.html")

    return app


@click.command()
@click.option("--port", default=8080, help="Port to run the server on.")
def server(port):
    """Run a simple and performant web server which serves the site for managing bookmarks"""
    app = create_app()
    click.echo(f"Starting revisit server on http://localhost:{port}")
    app.run(port=port, host="0.0.0.0", threaded=True)
