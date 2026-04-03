"""
Diary controller — orchestrates diary CRUD logic.

Validates input and delegates to diary_service.
Future: add encryption, tagging, or sentiment analysis here without changing routes.
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.services import diary_service
from app.models.diary import DiaryEntry


def handle_create_entry(db: Session, date: str, mood: str, text: str) -> DiaryEntry:
    """
    Validate and persist a new diary entry.
    Raises HTTP 422 if text or date is blank.
    """
    text = text.strip()
    date = date.strip()
    if not text:
        raise HTTPException(status_code=422, detail="Diary text cannot be empty")
    if not date:
        raise HTTPException(status_code=422, detail="Date cannot be empty")
    return diary_service.create_entry(db, date, mood, text)


def handle_get_entries(db: Session, limit: int) -> list[DiaryEntry]:
    """Return diary entries, clamped to a safe limit."""
    limit = min(max(limit, 1), 500)
    return diary_service.get_entries(db, limit=limit)


def handle_delete_entry(db: Session, entry_id: int) -> None:
    """
    Delete a diary entry by ID.
    Raises HTTP 404 if the entry does not exist.
    """
    deleted = diary_service.delete_entry(db, entry_id)
    if not deleted:
        raise HTTPException(
            status_code=404, detail=f"Diary entry {entry_id} not found"
        )
