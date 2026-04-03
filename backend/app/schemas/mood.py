"""Pydantic schemas for mood endpoints."""
from datetime import datetime
from pydantic import BaseModel, Field


class MoodCreate(BaseModel):
    emoji: str = Field(..., examples=["😊"], description="Emoji representing the user's mood")


class MoodResponse(BaseModel):
    id: int
    emoji: str
    mood_label: str
    created_at: datetime

    model_config = {"from_attributes": True}
