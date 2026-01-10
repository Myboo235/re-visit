import click
from revisit.db.sqlite.manager import DatabaseManager
from revisit.db.sqlite.repository import BookmarkRepository
from revisit.core.utils import parse_indices

@click.command()
@click.argument('indices', required=False)
def update(indices):
    """
    Update the saved bookmarks.
    Accepts space-separated list of indices, hyphenated range or both.
    If no indices provided, iterates through all bookmarks.
    """
    db_manager = DatabaseManager()
    repo = BookmarkRepository(db_manager)
    
    if indices:
        ids = list(parse_indices(indices))
        bookmarks = repo.get_by_ids(ids)
    else:
        bookmarks = repo.list_all()
        
    if not bookmarks:
        click.echo("No bookmarks found to update.")
        return
        
    for b in bookmarks:
        click.echo(f"\nUpdating bookmark {b.id}: {b.name}")
        b.url = click.prompt("  URL", default=b.url)
        b.name = click.prompt("  Name", default=b.name)
        tags_str = click.prompt("  Tags (comma-separated)", default=",".join(b.tags))
        b.tags = [t.strip() for t in tags_str.split(",")] if tags_str else []
        repo.update(b)
        click.echo("  Updated successfully.")
