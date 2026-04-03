"""
Mood routes — POST /mood, GET /mood
Delegates to mood_controller for all business logic.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.mood import MoodCreate, MoodResponse
from app.controllers import mood_controller

router = APIRouter(prefix="/mood", tags=["Mood"])


@router.post("", response_model=MoodResponse, status_code=201)
def log_mood(payload: MoodCreate, db: Session = Depends(get_db)):
    """
    Log an emoji mood check-in.
    The service layer detects the mood label automatically.

    **Input:** `{ "emoji": "😊" }`
    **Output:** `{ id, emoji, mood_label, created_at }`
    """
    return mood_controller.handle_log_mood(db, payload.emoji)


@router.get("", response_model=list[MoodResponse])
def mood_history(limit: int = 50, db: Session = Depends(get_db)):
    """
    Return recent mood check-ins (newest first).
    Use `?limit=N` to control how many to return (max 500).
    """
    return mood_controller.handle_get_mood_history(db, limit)
