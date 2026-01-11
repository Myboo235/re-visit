import os
import sqlite3
from pathlib import Path


class DatabaseManager:
    def __init__(self, db_path: str = "bookmarks.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        """Initialize the database and run migrations."""
        if not os.path.exists(self.db_path):
            Path(self.db_path).touch()
        
        self.run_migrations()

    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def run_migrations(self):
        migrations_dir = Path(__file__).parent / "migrations"
        if not migrations_dir.exists():
            raise FileNotFoundError(f"Migrations directory not found at {migrations_dir}. "
                                  "Ensure the package is installed correctly with all data files.")

        with self.get_connection() as conn:
            # We could implement a migrations table to track applied migrations,
            # but for this simple version, we'll just run them if table doesn't exist.
            # The SQL itself has IF NOT EXISTS.
            for migration_file in sorted(migrations_dir.glob("*.sql")):
                with open(migration_file, "r") as f:
                    conn.executescript(f.read())
            conn.commit()
