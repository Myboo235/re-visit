import click
import webbrowser
from revisit.db.sqlite.manager import DatabaseManager
from revisit.db.sqlite.repository import BookmarkRepository
from revisit.core.utils import parse_indices

@click.command(name="open")
@click.argument('indices', required=False)
def open_cmd(indices):
    """
    Open bookmarks in browser.
    Accepts space-separated list of indices, hyphenated range or both.
    If no arguments, asks for ID.
    """
    db_manager = DatabaseManager()
    repo = BookmarkRepository(db_manager)
    
    if not indices:
        indices = click.prompt("Enter bookmark ID(s) to open")
        
    ids = list(parse_indices(indices))
    if not ids:
        click.echo("No valid indices provided.")
        return

    bookmarks = repo.get_by_ids(ids)
    
    if not bookmarks:
        click.echo("No bookmarks found for given indices.")
        return
        
    for b in bookmarks:
        click.echo(f"Opening: {b.name} ({b.url})")
        webbrowser.open(b.url)
