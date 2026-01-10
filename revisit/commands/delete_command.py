import click
from revisit.db.sqlite.manager import DatabaseManager
from revisit.db.sqlite.repository import BookmarkRepository
from revisit.core.utils import parse_indices

@click.command()
@click.argument('indices')
def delete(indices):
    """
    Delete bookmarks by index.
    Accepts space-separated list of indices, hyphenated range or both.
    """
    db_manager = DatabaseManager()
    repo = BookmarkRepository(db_manager)
    
    ids = list(parse_indices(indices))
    if not ids:
        click.echo("No valid indices provided.")
        return
        
    repo.delete(ids)
    click.echo(f"Deleted bookmarks with indices: {', '.join(map(str, ids))}")
