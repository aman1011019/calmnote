"""
Chat service — rule-based AI responses with ML hooks.

To replace with an ML model:
  1. Install your model library (e.g. transformers, llama-cpp-python)
  2. Replace the body of `generate_response()` with model inference
  3. Keep the function signature identical — no route changes needed
"""
import random
from sqlalchemy.orm import Session
from app.models.chat import ChatHistory

# ─── Response templates ─────────────────────────────────────────────────────────

_RESPONSES: dict[str, list[str]] = {
    "sad": [
        "I'm here for you 💙 Want to talk about your day?",
        "It's okay to feel this way. You're not alone — I'm listening.",
        "Sometimes things feel heavy. Take a breath — we'll get through this together.",
        "I hear you. Would sharing what's on your mind help?",
        "You matter, and your feelings are valid. Tell me more if you'd like.",
    ],
    "happy": [
        "That's wonderful to hear 😊 What made your day good?",
        "Love that energy! Tell me what's been going great!",
        "Amazing! Happiness looks good on you 🌟 Share the good news!",
        "You're glowing today! What's the highlight of your day?",
        "Keep riding that wave 🏄 What brought this joy?",
    ],
    "neutral": [
        "How's everything going today? I'm here to listen.",
        "Sometimes a steady day is a good day. Anything on your mind?",
        "Thanks for checking in. How can I support you today?",
        "A quiet moment is a good moment. What would you like to talk about?",
        "I'm here whenever you're ready to share.",
    ],
}

_KEYWORD_OVERRIDES: list[tuple[list[str], str]] = [
    # (keywords, forced_mood_key)
    (["anxious", "anxiety", "nervous", "panic", "worried", "stress"], "sad"),
    (["grateful", "thankful", "excited", "great", "amazing", "wonderful"], "happy"),
]


def _pick_response(message: str, mood: str) -> str:
    """
    Select a response based on mood and optional keyword analysis.

    # ML_HOOK — Replace this function body with:
    #   response = ml_model.generate(prompt=message, mood=mood)
    #   return response
    """
    lowered = message.lower()
    effective_mood = mood

    # Simple keyword override (runs before mood label)
    for keywords, forced_mood in _KEYWORD_OVERRIDES:
        if any(kw in lowered for kw in keywords):
            effective_mood = forced_mood
            break

    templates = _RESPONSES.get(effective_mood, _RESPONSES["neutral"])
    return random.choice(templates)


def generate_response(message: str, mood: str) -> str:
    """
    Public entry point for generating an AI response.

    # ML_HOOK — Swap _pick_response for real model inference here if needed.
    """
    return _pick_response(message, mood)


def save_chat(db: Session, user_message: str, ai_response: str, mood: str) -> ChatHistory:
    """Persist a chat turn to the database."""
    entry = ChatHistory(
        user_message=user_message,
        ai_response=ai_response,
        mood=mood,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_chat_history(db: Session, limit: int = 50) -> list[ChatHistory]:
    """Return the most recent chat turns (newest first)."""
    return (
        db.query(ChatHistory)
        .order_by(ChatHistory.created_at.desc())
        .limit(limit)
        .all()
    )
