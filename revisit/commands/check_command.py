import click
import requests
from revisit.db.sqlite.manager import DatabaseManager
from revisit.db.sqlite.repository import BookmarkRepository

@click.command()
def check():
    """Check if links still exist on the internet"""
    db_manager = DatabaseManager()
    repo = BookmarkRepository(db_manager)
    bookmarks = repo.list_all()
    
    if not bookmarks:
        click.echo("No bookmarks to check.")
        return
        
    click.echo(f"Checking {len(bookmarks)} bookmarks...")
    for b in bookmarks:
        try:
            # Using a browser-like User-Agent to avoid some common blocks
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
            response = requests.head(b.url, timeout=10, headers=headers, allow_redirects=True)
            
            # If HEAD is not allowed, try GET but only first few bytes
            if response.status_code == 405:
                response = requests.get(b.url, timeout=10, headers=headers, stream=True)
                response.close()

            if response.status_code < 400:
                click.echo(click.style(f"  ✓ {b.id:3}: {b.name} is OK", fg="green"))
            else:
                click.echo(click.style(f"  ✗ {b.id:3}: {b.name} returned status {response.status_code}", fg="red"))
        except requests.RequestException as e:
            click.echo(click.style(f"  ✗ {b.id:3}: {b.name} failed: {type(e).__name__}", fg="red"))
