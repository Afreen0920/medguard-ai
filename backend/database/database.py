from contextlib import contextmanager
import os
import sqlite3
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]
DATABASE_PATH = Path(os.getenv("MEDGUARD_DB_PATH", BASE_DIR / "medguard.db"))


@contextmanager
def get_connection():
	connection = sqlite3.connect(DATABASE_PATH)
	connection.row_factory = sqlite3.Row
	try:
		yield connection
		connection.commit()
	finally:
		connection.close()


def initialize_database() -> None:
	with get_connection() as connection:
		connection.executescript(
			"""
			CREATE TABLE IF NOT EXISTS equipment (
				equipment_id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				criticality TEXT NOT NULL DEFAULT 'NORMAL',
				days_since_maintenance INTEGER NOT NULL DEFAULT 0,
				profile_json TEXT NOT NULL
			);
			CREATE TABLE IF NOT EXISTS alerts (
				alert_id TEXT PRIMARY KEY,
				equipment_id TEXT NOT NULL,
				severity TEXT NOT NULL,
				message TEXT NOT NULL,
				status TEXT NOT NULL DEFAULT 'active',
				acknowledged_by TEXT,
				acknowledged_at TEXT,
				resolved_by TEXT,
				resolved_at TEXT,
				created_at TEXT NOT NULL
			);
			"""
		)
