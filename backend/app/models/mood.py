"""ORM model for the moods table."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from app.database.database import Base


class Mood(Base):
    __tablename__ = "moods"

    id = Column(Integer, primary_key=True, index=True)
    emoji = Column(String, nullable=False)
    mood_label = Column(String, nullable=False)  # "happy" | "neutral" | "sad"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
