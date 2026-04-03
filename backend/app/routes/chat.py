"""
Chat routes — POST /chat, GET /chat/history
Delegates to chat_controller for all business logic.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas.chat import ChatRequest, ChatResponse, ChatHistoryItem
from app.controllers import chat_controller

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse, status_code=201)
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    """
    Send a message and receive an AI response.

    **Input:** `{ "message": "I feel anxious", "mood": "sad" }`
    **Output:** `{ id, response_text, mood, created_at }`

    The service layer is the **only** thing that changes when an ML model is added.
    See `services/chat_service.py` → `generate_response()` for the ML hook points.
    """
    return chat_controller.handle_send_message(db, payload.message, payload.mood)


@router.get("/history", response_model=list[ChatHistoryItem])
def chat_history(limit: int = 50, db: Session = Depends(get_db)):
    """
    Return past chat turns including both the user message and AI reply (newest first).
    Use `?limit=N` to control how many to return (max 500).
    """
    return chat_controller.handle_get_chat_history(db, limit)
