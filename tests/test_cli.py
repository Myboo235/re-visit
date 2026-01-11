from click.testing import CliRunner

from revisit.cli import revisit


def test_version_command():
    runner = CliRunner()
    result = runner.invoke(revisit, ['version'])
    assert result.exit_code == 0
    assert 'revisit version' in result.output

def test_print_empty():
    # Using a separate DB for testing would be better, 
    # but for now we just check if it runs without error.
    runner = CliRunner()
    result = runner.invoke(revisit, ['print'])
    # Might exit with 0 even if no bookmarks
    assert result.exit_code == 0
