"""
Mood service — detection + persistence.
"""
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.mood import Mood

# ─── Emoji → mood label mapping ────────────────────────────────────────────────
HAPPY_EMOJIS = {"😊", "😄", "😁", "🥰", "😍", "🤩", "😀", "🙂", "😌", "😎",
                "🥳", "😃", "😆", "😇", "🤗"}
SAD_EMOJIS   = {"😢", "😭", "😔", "😞", "😟", "🥺", "😿", "💔", "😥", "😓",
                "🤕", "😩", "😫", "😖", "😣"}


def detect_mood(emoji: str) -> str:
    """
    Map an emoji to a mood label.
    Returns 'happy', 'sad', or 'neutral'.
    """
    if emoji in HAPPY_EMOJIS:
        return "happy"
    if emoji in SAD_EMOJIS:
        return "sad"
    return "neutral"


def save_mood(db: Session, emoji: str) -> Mood:
    """Detect mood from emoji and persist to DB."""
    mood_label = detect_mood(emoji)
    entry = Mood(emoji=emoji, mood_label=mood_label)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_mood_history(db: Session, limit: int = 50) -> list[Mood]:
    """Return the most recent mood entries (newest first)."""
    return (
        db.query(Mood)
        .order_by(Mood.created_at.desc())
        .limit(limit)
        .all()
    )


def get_moods_last_n_days(db: Session, days: int = 7) -> list[Mood]:
    """Return all mood entries from the last N days."""
    from datetime import timedelta
    cutoff = datetime.utcnow() - timedelta(days=days)
    return (
        db.query(Mood)
        .filter(Mood.created_at >= cutoff)
        .order_by(Mood.created_at.asc())
        .all()
    )
