import click
import time
from revisit.db.sqlite.manager import DatabaseManager
from revisit.db.sqlite.repository import BookmarkRepository

@click.command()
@click.argument('output_file', type=click.Path())
def export(output_file):
    """Export bookmarks into HTML file in Netscape Bookmark format"""
    db_manager = DatabaseManager()
    repo = BookmarkRepository(db_manager)
    bookmarks = repo.list_all()
    
    if not bookmarks:
        click.echo("No bookmarks to export.")
        return
        
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("<!DOCTYPE NETSCAPE-Bookmark-file-1>\n")
        f.write("<!-- This is an automatically generated file.\n")
        f.write("     It will be read and overwritten.\n")
        f.write("     DO NOT EDIT! -->\n")
        f.write('<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n')
        f.write("<TITLE>Bookmarks</TITLE>\n")
        f.write("<H1>Bookmarks</H1>\n")
        f.write("<DL><p>\n")
        
        for b in bookmarks:
            # Convert datetime to unix timestamp
            timestamp = int(b.created_at.timestamp())
            tags = ",".join(b.tags)
            f.write(f'    <DT><A HREF="{b.url}" ADD_DATE="{timestamp}" TAGS="{tags}">{b.name}</A>\n')
            
        f.write("</DL><p>\n")
        
    click.echo(f"Exported {len(bookmarks)} bookmarks to {output_file}")
