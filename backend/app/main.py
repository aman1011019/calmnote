"""
CalmNote FastAPI application entry point.

PostgreSQL-backed, privacy-first AI mental health companion backend.
All data stays local — no external API calls.

Run:
    uvicorn app.main:app --reload
Docs:
    http://127.0.0.1:8000/docs
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from app.database.database import Base, engine

# ─── Register ORM models (must be imported before create_all) ──────────────────
import app.models.mood    # noqa: F401
import app.models.diary   # noqa: F401
import app.models.chat    # noqa: F401

# ─── Auto-create all tables in PostgreSQL ─────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ─── Logging setup ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("calmnote")

# ─── App setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="CalmNote API",
    description=(
        "Privacy-first AI mental health companion backend. "
        "Backed by PostgreSQL. No external APIs. "
        "AI/ML models can be plugged into the service layer without changing routes.\n\n"
        "All endpoints return consistent JSON. Errors follow the shape:\n"
        "`{ success: false, error: { code, message } }`"
    ),
    version="2.0.0",
)

# ─── CORS Middleware ────────────────────────────────────────────────────────────
# Allow all origins for local development (React Native + web + Expo work)
# In production: replace ["*"] with your actual frontend domain(s)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Error handler registration ───────────────────────────────────────────────
from fastapi import HTTPException
from app.utils.error_handlers import (
    http_exception_handler,
    validation_exception_handler,
    sqlalchemy_exception_handler,
    generic_exception_handler,
)

app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# ─── Register routers ──────────────────────────────────────────────────────────
from app.routes import mood, chat, diary, insights

app.include_router(mood.router)
app.include_router(chat.router)
app.include_router(diary.router)
app.include_router(insights.router)


# ─── Health check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    """Health check — confirms the API is running."""
    return {
        "status": "ok",
        "message": "CalmNote API is running 🧘",
        "version": "2.0.0",
        "docs": "/docs",
    }
