import click

from revisit.handlers.bookmark_handler import BookmarkHandler
from revisit.handlers.check_handler import CheckHandler


@click.command()
def check():
    """Check if links still exist on the internet"""
    bh = BookmarkHandler()
    ch = CheckHandler(bh)

    bookmarks = bh.list_bookmarks()
    if not bookmarks:
        click.echo("No bookmarks to check.")
        return

    click.echo(f"Checking {len(bookmarks)} bookmarks...")
    for b, (ok, status) in ch.check_all(yield_results=True):
        if ok:
            click.echo(click.style(f"  ✓ {b.id:3}: {b.name} is OK", fg="green"))
        else:
            click.echo(click.style(f"  ✗ {b.id:3}: {b.name} returned {status}", fg="red"))
