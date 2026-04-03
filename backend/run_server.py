"""
run_server.py — CalmNote auto-startup script.

Steps performed automatically:
  1. Load environment variables from .env
  2. Connect to PostgreSQL server (default connection: postgres / postgres @ localhost:5432)
  3. Create the 'calmnote' database if it does not already exist
  4. Create all ORM tables (moods, diary, chat_history) via SQLAlchemy
  5. Launch the FastAPI server with uvicorn

Usage:
    python run_server.py

Equivalent manual steps:
    createdb -U postgres calmnote          # step 3
    uvicorn app.main:app --reload          # step 5
"""

import os
import sys
import logging

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
log = logging.getLogger("calmnote.startup")

# ─── Step 1: Load .env ────────────────────────────────────────────────────────
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)

DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://postgres:postgres@localhost:5432/calmnote",
)

log.info("DATABASE_URL = %s", DATABASE_URL)

# ─── Step 2 & 3: Create database if it doesn't exist ─────────────────────────
def ensure_database_exists(db_url: str) -> None:
    """
    Connect to the PostgreSQL *server* (not the target DB) and create the
    target database if it does not already exist.

    PostgreSQL does not support CREATE DATABASE inside a transaction, so we
    set isolation_level=AUTOCOMMIT before executing the command.
    """
    import sqlalchemy
    from sqlalchemy import text

    # Parse the URL to find the target database name and build a server URL
    # (connecting to the built-in 'postgres' maintenance database instead).
    try:
        parsed = sqlalchemy.engine.url.make_url(db_url)
        target_db = parsed.database  # e.g. "calmnote"
        server_url = parsed.set(database="postgres")  # connects to maintenance DB
    except Exception as exc:
        log.warning("Could not parse DATABASE_URL as PostgreSQL — skipping DB creation. (%s)", exc)
        return

    if db_url.startswith("sqlite"):
        log.info("SQLite detected — skipping database creation step.")
        return

    log.info("Checking if database '%s' exists on the PostgreSQL server…", target_db)

    try:
        engine = sqlalchemy.create_engine(str(server_url), isolation_level="AUTOCOMMIT")
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :name"),
                {"name": target_db},
            )
            exists = result.fetchone() is not None

            if exists:
                log.info("✅  Database '%s' already exists — skipping creation.", target_db)
            else:
                # CREATE DATABASE cannot run inside a transaction; AUTOCOMMIT handles this.
                conn.execute(text(f'CREATE DATABASE "{target_db}"'))
                log.info("🆕  Database '%s' created successfully.", target_db)

        engine.dispose()

    except Exception as exc:
        log.error(
            "❌  Could not connect to PostgreSQL server to create database.\n"
            "    Error: %s\n\n"
            "    Make sure PostgreSQL is running and the credentials in .env are correct.\n"
            "    Default .env values: user=postgres, password=postgres, host=localhost, port=5432\n"
            "    You can also create the database manually:\n"
            "        psql -U postgres -c \"CREATE DATABASE calmnote;\"\n",
            exc,
        )
        sys.exit(1)


# ─── Step 4: Create all ORM tables ────────────────────────────────────────────
def create_tables() -> None:
    """
    Import all ORM models and call Base.metadata.create_all().
    This is safe to call repeatedly — existing tables are never dropped.
    """
    log.info("Creating database tables if they do not exist…")

    try:
        from app.database.database import Base, engine

        # Import all models so SQLAlchemy knows about them before create_all()
        import app.models.mood   # noqa: F401
        import app.models.diary  # noqa: F401
        import app.models.chat   # noqa: F401

        Base.metadata.create_all(bind=engine)
        log.info("✅  Tables ready: moods, diary, chat_history")

    except Exception as exc:
        log.error(
            "❌  Failed to create tables.\n"
            "    Error: %s\n\n"
            "    Ensure DATABASE_URL in .env is correct and the database was created.\n",
            exc,
        )
        sys.exit(1)


# ─── Step 5: Launch uvicorn ───────────────────────────────────────────────────
def start_server() -> None:
    """Start the FastAPI app with uvicorn."""
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("APP_ENV", "development") == "development"

    log.info("🚀  Starting CalmNote API on http://%s:%s", host, port)
    log.info("    Interactive docs → http://127.0.0.1:%s/docs", port)
    log.info("    Reload mode: %s", reload)

    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info",
    )


# ─── Entry point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    ensure_database_exists(DATABASE_URL)
    create_tables()
    start_server()
