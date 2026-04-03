"""ORM model for the diary table."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database.database import Base


class DiaryEntry(Base):
    __tablename__ = "diary"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, nullable=False)          # ISO date string "YYYY-MM-DD"
    mood = Column(String, nullable=False)           # "happy" | "neutral" | "sad"
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
