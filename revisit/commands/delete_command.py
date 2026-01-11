import click

from revisit.handlers.bookmark_handler import BookmarkHandler


@click.command()
@click.argument('indices')
def delete(indices):
    """
    Delete bookmarks by index.
    Accepts space-separated list of indices, hyphenated range or both.
    """
    handler = BookmarkHandler()
    ids = handler.delete_bookmarks(indices)
    
    if not ids:
        click.echo("No valid indices provided.")
    else:
        click.echo(f"Deleted bookmarks with indices: {', '.join(map(str, ids))}")
