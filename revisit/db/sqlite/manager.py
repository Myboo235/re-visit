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
            raise FileNotFoundError(
                f"Migrations directory not found at {migrations_dir}. "
                "Ensure the package is installed correctly with all data files."
            )

        with self.get_connection() as conn:
            # Create migrations tracking table
            conn.execute(
                "CREATE TABLE IF NOT EXISTS schema_migrations (migration_name TEXT PRIMARY KEY)"
            )

            # Get already applied migrations
            cursor = conn.execute("SELECT migration_name FROM schema_migrations")
            applied_migrations = {row["migration_name"] for row in cursor.fetchall()}

            # Run new migrations in order
            for migration_file in sorted(migrations_dir.glob("*.sql")):
                name = migration_file.name
                if name not in applied_migrations:
                    print(f"Applying migration: {name}")
                    with open(migration_file, "r") as f:
                        conn.executescript(f.read())
                    conn.execute(
                        "INSERT INTO schema_migrations (migration_name) VALUES (?)", (name,)
                    )
            conn.commit()
