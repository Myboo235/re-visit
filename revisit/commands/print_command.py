import click

from revisit.handlers.bookmark_handler import BookmarkHandler


@click.command(name="print")
@click.argument("indices", required=False)
def print_cmd(indices):
    """
    Show the saved bookmarks by its database index.
    Accepts space-separated list of indices (e.g. 5 6 23 4 110 45),
    hyphenated range (e.g. 100-200) or both (e.g. 1-3 7 9).
    If no arguments, all records are shown.
    """
    handler = BookmarkHandler()
    bookmarks = handler.list_bookmarks(indices)

    if not bookmarks:
        click.echo("No bookmarks found.")
        return

    for b in bookmarks:
        tags_str = f" [{', '.join(b.tags)}]" if b.tags else ""
        click.echo(f"{b.id:3}: {b.name} - {b.url}{tags_str}")
