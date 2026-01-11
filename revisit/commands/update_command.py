import click

from revisit.handlers.bookmark_handler import BookmarkHandler


@click.command()
@click.argument('indices', required=False)
def update(indices):
    """
    Update the saved bookmarks.
    Accepts space-separated list of indices, hyphenated range or both.
    If no indices provided, iterates through all bookmarks.
    """
    handler = BookmarkHandler()
    bookmarks = handler.list_bookmarks(indices)
        
    if not bookmarks:
        click.echo("No bookmarks found to update.")
        return
        
    for b in bookmarks:
        click.echo(f"\nUpdating bookmark {b.id}: {b.name}")
        new_url = click.prompt("  URL", default=b.url)
        new_name = click.prompt("  Name", default=b.name)
        tags_str = click.prompt("  Tags (comma-separated)", default=",".join(b.tags))
        new_tags = [t.strip() for t in tags_str.split(",")] if tags_str else []
        
        handler.update_bookmark(b.id, url=new_url, name=new_name, tags=new_tags)
        click.echo("  Updated successfully.")
