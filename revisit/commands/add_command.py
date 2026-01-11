import click

from revisit.handlers.bookmark_handler import BookmarkHandler


@click.command()
@click.option("--url", required=True, help="URL of the bookmark.")
@click.option("--name", required=True, help="Name of the bookmark.")
@click.option("--tags", help="Tags of the bookmark (comma-separated).")
def add(url, name, tags):
    """Add a bookmark"""
    handler = BookmarkHandler()
    tag_list = [t.strip() for t in tags.split(",")] if tags else []

    handler.add_bookmark(url=url, name=name, tags=tag_list)
    click.echo(f"Successfully added bookmark: {name} ({url})")


if __name__ == "__main__":
    add()
