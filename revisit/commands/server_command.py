import os

import click
from flask import Flask, jsonify, request, send_from_directory

from revisit.handlers.bookmark_handler import BookmarkHandler


def create_app():
    # Path to the built web files
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    dist_dir = os.path.join(base_dir, "web", "dist")

    app = Flask(__name__, static_folder=dist_dir)
    bh = BookmarkHandler()

    # API Routes
    @app.route("/api/bookmarks", methods=["GET"])
    def get_bookmarks():
        bookmarks = bh.list_bookmarks()
        data = []
        for b in bookmarks:
            data.append(
                {
                    "id": str(b.id),
                    "title": b.name,
                    "url": b.url,
                    "description": "",
                    "tags": b.tags,
                    "createdAt": b.created_at.isoformat(),
                    "updatedAt": b.created_at.isoformat(),
                }
            )
        return jsonify(data)

    @app.route("/api/bookmarks", methods=["POST"])
    def add_bookmark():
        req_data = request.get_json()
        b = bh.add_bookmark(
            url=req_data["url"],
            name=req_data.get("title", req_data.get("name", "unnamed")),
            tags=req_data.get("tags", []),
        )
        return jsonify(
            {
                "id": str(b.id),
                "title": b.name,
                "url": b.url,
                "tags": b.tags,
                "createdAt": b.created_at.isoformat(),
            }
        ), 201

    @app.route("/api/bookmarks/<int:bookmark_id>", methods=["PUT"])
    def update_bookmark_api(bookmark_id):
        req_data = request.get_json()
        ok = bh.update_bookmark(
            bookmark_id,
            url=req_data.get("url"),
            name=req_data.get("title", req_data.get("name")),
            tags=req_data.get("tags"),
        )
        if not ok:
            return jsonify({"error": "Not found"}), 404
        return jsonify({"status": "success"})

    @app.route("/api/bookmarks/<int:bookmark_id>", methods=["DELETE"])
    def delete_bookmark_api(bookmark_id):
        bh.delete_bookmarks(str(bookmark_id))
        return jsonify({"status": "success"})

    # Catch-all route for SPA
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
    # Disable flask logging to make it cleaner? No, let's keep it for now.
    click.echo(f"Starting revisit server on http://localhost:{port}")
    app.run(port=port, host="0.0.0.0", threaded=True)
