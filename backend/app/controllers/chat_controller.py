"""
Chat controller — orchestrates chat route logic.

Combines AI response generation with persistence in one place.
When an ML model replaces generate_response(), this controller stays unchanged.

# ML_HOOK — future: add intent detection, context windowing, or session handling here.
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.services import chat_service, ai_service
from app.models.chat import ChatHistory
from app.schemas.chat import ChatResponse


def handle_send_message(db: Session, message: str, mood: str) -> ChatResponse:
    """
    Generate an AI reply and persist the conversation turn.
    Raises HTTP 400 if message is blank after stripping whitespace.
    """
    message = message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Fetch last 5 messages to build context for ai_service
    recent_history = chat_service.get_chat_history(db, limit=5)
    context = []
    # Reverse to process oldest to newest (since queries return order_by desc)
    for h in reversed(recent_history):
        context.append({
            "user": h.user_message,
            "ai": h.ai_response,
            "mood": h.mood
        })

    # Pass to ai_service
    ai_result = ai_service.handle_chat(message, mood, context)

    # Note: ai_result contains mood, motion, context, response, action_trigger.
    # We use ai_result["response"] and the originally submitted mood.
    ai_response = ai_result["response"]
    action_trigger = ai_result.get("action_trigger")

    # Persist via the existing service
    saved = chat_service.save_chat(db, message, ai_response, mood)

    return ChatResponse(
        id=saved.id,
        response_text=saved.ai_response,
        mood=saved.mood,
        created_at=saved.created_at,
        action_trigger=action_trigger
    )


def handle_get_chat_history(db: Session, limit: int) -> list[ChatHistory]:
    """Return recent chat turns, clamped to a safe limit."""
    limit = min(max(limit, 1), 500)
    return chat_service.get_chat_history(db, limit=limit)
