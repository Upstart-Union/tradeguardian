import sqlite3
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_PATH = BASE_DIR / "tradeguardian.db"


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DATABASE_PATH)

    connection.row_factory = sqlite3.Row

    return connection


def initialize_database() -> None:
    connection = get_connection()

    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS analysis_history (
            audit_id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            data TEXT NOT NULL
        )
        """
    )

    connection.commit()
    connection.close()