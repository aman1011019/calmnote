"""Pydantic schemas for chat endpoints."""
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User's message")
    mood: Literal["happy", "neutral", "sad", "angry", "tired", "loved"] = Field(
        "neutral", description="Current mood context"
    )


class ChatResponse(BaseModel):
    response_text: str
    mood: str
    id: int
    created_at: datetime
    action_trigger: str | None = None

    model_config = {"from_attributes": True}


class ChatHistoryItem(BaseModel):
    id: int
    user_message: str
    ai_response: str
    mood: str
    created_at: datetime

    model_config = {"from_attributes": True}
