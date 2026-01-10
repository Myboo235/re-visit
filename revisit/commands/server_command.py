import click
from flask import Flask, render_template_string
from revisit.db.sqlite.manager import DatabaseManager
from revisit.db.sqlite.repository import BookmarkRepository

def create_app():
    app = Flask(__name__)
    db_manager = DatabaseManager()
    repo = BookmarkRepository(db_manager)

    HTML_TEMPLATE = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Revisit Bookmark Manager</title>
        <style>
            :root {
                --primary: #2563eb;
                --bg: #f8fafc;
                --text: #1e293b;
                --card-bg: #ffffff;
            }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                margin: 0;
                background: var(--bg);
                color: var(--text);
                line-height: 1.5;
            }
            .container {
                max-width: 900px;
                margin: 40px auto;
                padding: 0 20px;
            }
            header {
                margin-bottom: 40px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            h1 { margin: 0; font-size: 2rem; color: var(--primary); }
            .bookmark-list {
                display: grid;
                gap: 16px;
            }
            .bookmark-card {
                background: var(--card-bg);
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .bookmark-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
            }
            .bookmark-name {
                display: block;
                font-size: 1.25rem;
                font-weight: 600;
                color: var(--primary);
                text-decoration: none;
                margin-bottom: 4px;
            }
            .bookmark-url {
                font-size: 0.875rem;
                color: #64748b;
                word-break: break-all;
            }
            .tags {
                margin-top: 12px;
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            .tag {
                background: #f1f5f9;
                color: #475569;
                padding: 4px 10px;
                border-radius: 9999px;
                font-size: 0.75rem;
                font-weight: 500;
            }
            .empty-state {
                text-align: center;
                padding: 60px;
                color: #64748b;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>Revisit</h1>
                <span>{{ bookmarks|length }} Bookmarks</span>
            </header>
            
            <div class="bookmark-list">
                {% for b in bookmarks %}
                <div class="bookmark-card">
                    <a href="{{ b.url }}" class="bookmark-name" target="_blank">{{ b.name }}</a>
                    <div class="bookmark-url">{{ b.url }}</div>
                    {% if b.tags %}
                    <div class="tags">
                        {% for tag in b.tags %}
                        <span class="tag">{{ tag }}</span>
                        {% endfor %}
                    </div>
                    {% endif %}
                </div>
                {% else %}
                <div class="empty-state">
                    <p>No bookmarks found. Use <code>revisit add</code> to get started!</p>
                </div>
                {% endfor %}
            </div>
        </div>
    </body>
    </html>
    """

    @app.route('/')
    def index():
        bookmarks = repo.list_all()
        return render_template_string(HTML_TEMPLATE, bookmarks=bookmarks)

    return app

@click.command()
@click.option('--port', default=8080, help='Port to run the server on.')
def server(port):
    """Run a simple and performant web server which serves the site for managing bookmarks"""
    app = create_app()
    click.echo(f"Starting revisit server on http://localhost:{port}")
    app.run(port=port, host='0.0.0.0')
