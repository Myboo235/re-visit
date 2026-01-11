import click

from revisit.handlers.bookmark_handler import BookmarkHandler
from revisit.handlers.io_handler import IOHandler


@click.command(name="import")
@click.argument('input_file', type=click.Path(exists=True))
def import_cmd(input_file):
    """Import bookmarks from HTML file in Netscape Bookmark format"""
    bh = BookmarkHandler()
    ioh = IOHandler(bh)
    
    count = ioh.import_from_html(input_file)
    if count > 0:
        click.echo(f"Imported {count} bookmarks from {input_file}")
    else:
        click.echo("No bookmarks found in file.")
