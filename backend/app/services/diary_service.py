"""
Diary service — CRUD helpers for journal entries.
"""
from sqlalchemy.orm import Session
from app.models.diary import DiaryEntry


def create_entry(db: Session, date: str, mood: str, text: str) -> DiaryEntry:
    """Create and persist a new diary entry."""
    entry = DiaryEntry(date=date, mood=mood, text=text)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_entries(db: Session, limit: int = 100) -> list[DiaryEntry]:
    """Return all diary entries, newest first."""
    return (
        db.query(DiaryEntry)
        .order_by(DiaryEntry.created_at.desc())
        .limit(limit)
        .all()
    )


def delete_entry(db: Session, entry_id: int) -> bool:
    """
    Delete a diary entry by ID.
    Returns True if deleted, False if not found.
    """
    entry = db.query(DiaryEntry).filter(DiaryEntry.id == entry_id).first()
    if not entry:
        return False
    db.delete(entry)
    db.commit()
    return True
