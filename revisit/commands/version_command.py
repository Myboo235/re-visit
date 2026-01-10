import click

VERSION = "0.1.0"

@click.command()
def version():
    """Output the revisit version"""
    click.echo(f"revisit version {VERSION}")
