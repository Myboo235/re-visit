import webbrowser

import click

from revisit.handlers.bookmark_handler import BookmarkHandler


@click.command(name="open")
@click.argument('indices', required=False)
def open_cmd(indices):
    """
    Open bookmarks in browser.
    Accepts space-separated list of indices, hyphenated range or both.
    If no arguments, asks for ID.
    """
    handler = BookmarkHandler()
    
    if not indices:
        indices = click.prompt("Enter bookmark ID(s) to open")
        
    bookmarks = handler.list_bookmarks(indices)
    
    if not bookmarks:
        click.echo("No bookmarks found for given indices.")
        return
        
    for b in bookmarks:
        click.echo(f"Opening: {b.name} ({b.url})")
        webbrowser.open(b.url)
