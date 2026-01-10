# Revisit Bookmark Manager - Documentation

## Project Setup

1. **Prerequisites**: Ensure you have `uv` installed.
2. **Environment**: Create and activate a virtual environment:
   ```bash
   uv venv
   source .venv/bin/activate
   ```
3. **Dependencies**: Install dependencies using `uv`:
   ```bash
   uv sync
   ```

## Building the Project

You can build the project into a distributable wheel and source archive using:
```bash
just build
```
The artifacts will be generated in the `dist/` directory.

## Database and Migrations

The project uses SQLite for storage. 

### Running Migrations
Migrations are handled automatically by the `DatabaseManager` when you run any command.
- Migrations are stored in `revisit/db/sqlite/migrations/`.
- They are applied in alphabetical order.

### Resetting the Database
To reset your database (deleting all bookmarks):
```bash
just db-reset
```

## CLI Usage

Run any command using `just run`:

- `just run add --url <URL> --name <NAME>`: Add a bookmark.
- `just run print`: List all bookmarks.
- `just run check`: Verify link availability.
- `just run server`: Launch the web interface (default: http://localhost:8080).
- `just run export <file.html>`: Export to Netscape format.
- `just run import <file.html>`: Import from Netscape format.

## Running Tests

Execute the test suite using:
```bash
just test
```
