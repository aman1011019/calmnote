"""
Database configuration — PostgreSQL + SQLAlchemy.

Connection string is read from the DATABASE_URL environment variable (see .env).
Tables are created automatically on startup via Base.metadata.create_all().

To switch databases later (e.g. async PostgreSQL with asyncpg), only this file
needs to change — all other layers remain identical.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv

# Load .env from the backend root directory
load_dotenv()

# ─── Database URL ──────────────────────────────────────────────────────────────
# PostgreSQL: postgresql+psycopg2://user:password@host:port/dbname
# Default falls back to a safe local SQLite for development without any setup
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "sqlite:///./calmnote.db",  # fallback for quick local testing
)

# Pool args only valid for PostgreSQL (SQLite uses a StaticPool or NullPool)
_pool_args = (
    {
        "pool_pre_ping": True,  # Reconnect dropped connections automatically
        "pool_size": 5,         # Number of persistent connections
        "max_overflow": 10,     # Extra connections allowed under heavy load
    }
    if not DATABASE_URL.startswith("sqlite")
    else {
        "pool_pre_ping": False,  # Not applicable to SQLite
    }
)

# connect_args only used for SQLite (check_same_thread). Not needed for Postgres.
_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=_connect_args,
    **_pool_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


# ─── FastAPI dependency ────────────────────────────────────────────────────────
def get_db():
    """
    Yield a database session and ensure it is always closed afterward.
    Inject with: db: Session = Depends(get_db)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
