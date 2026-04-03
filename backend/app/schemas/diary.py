"""Pydantic schemas for diary endpoints."""
from datetime import datetime
from pydantic import BaseModel, Field


class DiaryCreate(BaseModel):
    date: str = Field(..., examples=["2024-01-15"], description="ISO date string YYYY-MM-DD")
    mood: str = Field(..., examples=["happy"], description="happy | neutral | sad")
    text: str = Field(..., min_length=1, description="Journal entry text")


class DiaryResponse(BaseModel):
    id: int
    date: str
    mood: str
    text: str
    created_at: datetime

    model_config = {"from_attributes": True}
