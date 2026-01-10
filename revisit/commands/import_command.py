import click
import re
from revisit.domain.bookmark import Bookmark
from revisit.db.sqlite.manager import DatabaseManager
from revisit.db.sqlite.repository import BookmarkRepository

@click.command(name="import")
@click.argument('input_file', type=click.Path(exists=True))
def import_cmd(input_file):
    """Import bookmarks from HTML file in Netscape Bookmark format"""
    db_manager = DatabaseManager()
    repo = BookmarkRepository(db_manager)
    
    with open(input_file, "r", encoding="utf-8") as f:
        content = f.read()
        
    # A simple regex to find bookmarks. 
    # Real Netscape format can be nested with folders, but we'll start with flat list.
    pattern = re.compile(r'<A HREF="([^"]+)"(?:[^>]*ADD_DATE="([^"]*)")?(?:[^>]*TAGS="([^"]*)")?[^>]*>([^<]*)</A>', re.IGNORECASE)
    
    matches = pattern.findall(content)
    if not matches:
        click.echo("No bookmarks found in file.")
        return
        
    count = 0
    for url, date, tags_str, name in matches:
        tag_list = [t.strip() for t in tags_str.split(",")] if tags_str else []
        bookmark = Bookmark(url=url, name=name or url, tags=tag_list)
        # Note: we ignore date for simplicity in adding, using current date
        repo.add(bookmark)
        count += 1
        
    click.echo(f"Imported {count} bookmarks from {input_file}")
