"""ORM model for the chat_history table."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database.database import Base


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_message = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    mood = Column(String, nullable=False)           # mood context at time of message
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
