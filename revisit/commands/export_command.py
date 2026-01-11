import click

from revisit.handlers.bookmark_handler import BookmarkHandler
from revisit.handlers.io_handler import IOHandler


@click.command()
@click.argument('output_file', type=click.Path())
def export(output_file):
    """Export bookmarks into HTML file in Netscape Bookmark format"""
    bh = BookmarkHandler()
    ioh = IOHandler(bh)
    
    count = ioh.export_to_html(output_file)
    if count > 0:
        click.echo(f"Exported {count} bookmarks to {output_file}")
    else:
        click.echo("No bookmarks to export.")
