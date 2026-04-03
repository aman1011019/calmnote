"""
Insights routes — GET /insights
Returns a mood summary for the last 7 days.
"""
from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.mood_service import get_moods_last_n_days

router = APIRouter(prefix="/insights", tags=["Insights"])


@router.get("")
def get_insights(db: Session = Depends(get_db)):
    """
    Return a mood summary for the last 7 days:
    - total check-ins
    - count per mood label
    - dominant mood
    - daily breakdown (date → mood_label list)
    """
    moods = get_moods_last_n_days(db, days=7)

    counts = Counter(m.mood_label for m in moods)

    # Build daily breakdown
    daily: dict[str, list[str]] = {}
    for m in moods:
        day = m.created_at.strftime("%Y-%m-%d")
        daily.setdefault(day, []).append(m.mood_label)

    dominant = counts.most_common(1)[0][0] if counts else "neutral"

    return {
        "period_days": 7,
        "total_checkins": len(moods),
        "mood_counts": {
            "happy": counts.get("happy", 0),
            "neutral": counts.get("neutral", 0),
            "sad": counts.get("sad", 0),
        },
        "dominant_mood": dominant,
        "daily_breakdown": daily,
    }
