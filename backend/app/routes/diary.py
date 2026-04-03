"""
Diary routes — POST /diary, GET /diary, DELETE /diary/{id}
Delegates to diary_controller for all business logic.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.diary import DiaryCreate, DiaryResponse
from app.controllers import diary_controller

router = APIRouter(prefix="/diary", tags=["Diary"])


@router.post("", response_model=DiaryResponse, status_code=201)
def create_diary_entry(payload: DiaryCreate, db: Session = Depends(get_db)):
    """
    Create a new journal entry.

    **Input:** `{ "date": "2024-01-15", "mood": "happy", "text": "Today was great..." }`
    **Output:** `{ id, date, mood, text, created_at }`
    """
    return diary_controller.handle_create_entry(
        db, payload.date, payload.mood, payload.text
    )


@router.get("", response_model=list[DiaryResponse])
def get_diary_entries(limit: int = 100, db: Session = Depends(get_db)):
    """Return all journal entries, newest first. Use `?limit=N` (max 500)."""
    return diary_controller.handle_get_entries(db, limit)


@router.delete("/{entry_id}", status_code=204)
def delete_diary_entry(entry_id: int, db: Session = Depends(get_db)):
    """Delete a journal entry by ID. Returns 204 on success, 404 if not found."""
    diary_controller.handle_delete_entry(db, entry_id)
