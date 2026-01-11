import click

from revisit.commands.add_command import add
from revisit.commands.check_command import check
from revisit.commands.delete_command import delete
from revisit.commands.export_command import export
from revisit.commands.import_command import import_cmd
from revisit.commands.open_command import open_cmd
from revisit.commands.print_command import print_cmd
from revisit.commands.server_command import server
from revisit.commands.update_command import update
from revisit.commands.version_command import version


@click.group()
def revisit():
    """Revisit is a bookmark manager with custom webview"""
    pass

revisit.add_command(add)
revisit.add_command(version)
revisit.add_command(print_cmd)
revisit.add_command(delete)
revisit.add_command(update)
revisit.add_command(open_cmd)
revisit.add_command(check)
revisit.add_command(export)
revisit.add_command(import_cmd)
revisit.add_command(server)

if __name__ == '__main__':
    revisit()
