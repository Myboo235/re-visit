import click
from revisit.domain.bookmark import Bookmark
from revisit.db.sqlite.manager import DatabaseManager
from revisit.db.sqlite.repository import BookmarkRepository

@click.command()
@click.option('--url', required=True, help='URL of the bookmark.')
@click.option('--name', required=True, help='Name of the bookmark.')
@click.option('--tags', help='Tags of the bookmark (comma-separated).')
def add(url, name, tags):
    """Add a bookmark"""
    db_manager = DatabaseManager()
    repo = BookmarkRepository(db_manager)
    
    tag_list = [t.strip() for t in tags.split(",")] if tags else []
    bookmark = Bookmark(url=url, name=name, tags=tag_list)
    
    repo.add(bookmark)
    click.echo(f"Successfully added bookmark: {name} ({url})")

if __name__ == '__main__':
    add()
