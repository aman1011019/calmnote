"""
Mood controller — orchestrates mood route logic.

This layer sits between the FastAPI route and the service.
In a larger app, it would handle:
  - Input sanitisation beyond Pydantic
  - Combining multiple service calls
  - Business rule enforcement

To add ML-based mood detection:
  Replace detect_mood() inside mood_service.py — this controller needs no changes.
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.services import mood_service
from app.models.mood import Mood


def handle_log_mood(db: Session, emoji: str) -> Mood:
    """
    Validate emoji and persist the mood check-in.
    Raises HTTP 422 if emoji is blank.
    """
    if not emoji.strip():
        raise HTTPException(status_code=422, detail="Emoji cannot be empty")
    return mood_service.save_mood(db, emoji)


def handle_get_mood_history(db: Session, limit: int) -> list[Mood]:
    """Return recent mood entries, clamped to a reasonable limit."""
    limit = min(max(limit, 1), 500)
    return mood_service.get_mood_history(db, limit=limit)
