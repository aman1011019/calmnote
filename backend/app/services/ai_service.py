"""
Offline, Lightweight AI Module for CalmNote
Provides robust mood detection, response generation, and context handling.
No external API dependencies. Low memory usage.
"""

import random
from typing import Dict, List, Any

# =====================================================================
# PART 1: MOOD DETECTION
# =====================================================================

EMOJI_TO_MOOD: Dict[str, str] = {
    "😊": "happy",
    "😐": "neutral",
    "😢": "sad",
    "😡": "angry",
    "😴": "tired",
    "😍": "loved",
}

def detect_mood_from_emoji(emoji: str) -> str:
    """
    Map emoji strictly to core moods. Fallback to neutral if unknown.
    """
    if not emoji:
        return "neutral"
    
    # Direct match
    if emoji in EMOJI_TO_MOOD:
        return EMOJI_TO_MOOD[emoji]
    
    # Partial match if multiple emojis passed
    for key, val in EMOJI_TO_MOOD.items():
        if key in emoji:
            return val
            
    return "neutral"

# =====================================================================
# PART 2: EMOTION DETECTION
# =====================================================================

keyword_map = {
    "overwhelm": ["too much", "overwhelmed", "drowning", "can't handle", "stress"],
    "anxious": ["worry", "anxious", "panic", "scared", "nervous"],
    "hopeful": ["excited", "looking forward", "getting better", "hope"],
    "grief": ["loss", "miss", "gone", "heartbreak"],
    "burnout": ["exhausted", "done", "give up", "drained"],
}

def detect_emotion_from_text(text: str) -> str:
    """
    Extract deeper emotional signals from raw text input.
    """
    if not text:
        return "none"
        
    lower_text = text.lower()
    
    for emotion, keywords in keyword_map.items():
        if any(kw in lower_text for kw in keywords):
            return emotion
            
    return "none"

# =====================================================================
# PART 3: SMART RESPONSE ENGINE (12 per mood)
# =====================================================================

RESPONSES = {
    "happy": [
        "That's wonderful! Tell me more about what's making you smile.",
        "I love hearing that! What's the highlight of this moment?",
        "Your energy is contagious! Soak up this feeling.",
        "That's fantastic news. You deserve to feel this good.",
        "Amazing! Things are really looking up, aren't they?",
        "Yay! Moments like this are what make it all worth it.",
        "I'm so glad to hear you're feeling this way! Keep radiating that joy.",
        "Love to see it! Did something specific trigger this happiness?",
        "This is great. Let's bottle this positive energy!",
        "Brilliant! It's so nice to experience genuine joy.",
        "That really brightens the day. Keep enjoying yourself!",
        "So happy for you! Embrace every second of this."
    ],
    "neutral": [
        "How is the rest of your day shaping up?",
        "I'm here. Is there anything specific on your mind?",
        "Sometimes a calm, quiet day is exactly what we need.",
        "Just checking in. How are things flowing for you?",
        "I'm listening. Feel free to share whatever comes up.",
        "A steady baseline is good. Anything interesting happen today?",
        "I'm around. Let me know if you need to vent or just chat.",
        "Taking it one step at a time. What are you up to?",
        "Quiet moments are nice. How are your energy levels?",
        "I'm right here with you. It's okay to just exist right now.",
        "No pressure to feel high or low. What's observing your thoughts like today?",
        "I'm holding space for you. Whenever you're ready, I'm here."
    ],
    "sad": [
        "I'm so sorry you're feeling this way. I'm here for you.",
        "It's okay to feel sad. You don't have to carry this alone.",
        "I hear how heavy this feels. I'm sitting right here with you.",
        "Take all the time you need. Your feelings are completely valid.",
        "I wish I could make it better. Do you want to talk about it?",
        "You are so strong for navigating this. I'm listening without judgment.",
        "It's okay to cry, and it's okay to hurt. I'm here.",
        "You're not alone in this. Sometimes we just need to feel the sadness.",
        "I hear you. Wrap yourself in a warm blanket and be gentle with yourself today.",
        "I'm sending you comfort. What is the hardest part right now?",
        "It's okay if today is just about survival. Let yourself rest.",
        "You matter, even when everything feels incredibly dark."
    ],
    "angry": [
        "I can feel how frustrating this must be for you.",
        "It makes total sense why you're mad. That's incredibly unfair.",
        "Let it out. You have every right to feel angry right now.",
        "I hear your frustration loud and clear. Do you want to vent?",
        "Anger is a natural response. I'm here to listen to it all.",
        "That sounds infuriating. Let's take a deep breath together.",
        "I'm on your side. It's okay to be furious about this.",
        "Don't hold it back. Expressing anger is healthy. What else is bothering you?",
        "Your anger is protecting you. What boundary crossed made you feel this way?",
        "It boils my blood for you too. Focus on your breathing for a second.",
        "You're allowed to be angry. Let's grounds ourselves a little bit.",
        "I see your anger. We will get through this intense wave together."
    ],
    "tired": [
        "You've been doing so much. It's time to let yourself actually rest.",
        "I can hear the exhaustion. Please be gentle with your body today.",
        "You don't have to be productive today. Resting is doing something.",
        "Close your eyes for a moment. You deserve to recharge.",
        "Your battery is depleted. What's one relaxing thing you can do right now?",
        "I'm proud of you for making it this far. Now, it's time to pause.",
        "Take it slow today. The world can wait while you recover.",
        "You must be drained. Consider prioritizing sleep over everything else today.",
        "Burnout is real. Give yourself permission to do absolutely nothing.",
        "I hear you. Let the heaviness sink into the couch and just breathe.",
        "It's okay to cancel plans and just rest. Your health comes first.",
        "You've fought hard. Lie down and let your mind drift off."
    ],
    "loved": [
        "That's so beautiful. Love is such an incredible feeling to experience.",
        "My heart warms hearing this! Hold onto this connection securely.",
        "You deserve all the love in the world. Enjoy this beautiful moment.",
        "It sounds like you're surrounded by wonderful energy right now.",
        "That's so sweet. Being cherished is exactly what you deserve.",
        "I love this for you! Love brings such a magical light to our days.",
        "It's amazing how feeling loved can completely shift our perspective.",
        "Cherish this warmth. What specifically makes you feel so appreciated?",
        "You radiate good energy! Let this feeling of love fill your entire day.",
        "Such a pure emotion! I'm so happy you are experiencing this joy.",
        "This makes me smile. Acknowledge the people who bring you this peace.",
        "You are worthy of this exact love and care. Always remember that."
    ]
}

# =====================================================================
# PART 4 & 6: CONTEXT AWARENESS & SMART FEATURES
# =====================================================================

def _get_contextual_prefix(mood: str, previous_moods: List[str]) -> str:
    if not previous_moods:
        return ""
        
    last_mood = previous_moods[-1]
    
    # Negative to Positive Shift
    if last_mood in ["sad", "angry", "tired"] and mood in ["happy", "loved"]:
        return "I'm so glad to see things are looking up from earlier! "
        
    # Persistent Negative
    if last_mood == "sad" and mood == "sad":
        return "I see you're still feeling down. "
        
    # Sudden drop
    if last_mood in ["happy", "loved"] and mood in ["sad", "angry"]:
        return "I'm sorry your mood shifted. It's okay if things got tough. "
        
    return ""

def _get_smart_feature_suffix(mood: str, emotion: str) -> str:
    """Append actionable, gentle advice based on emotion/mood mapping."""
    
    if emotion == "overwhelm":
        return "\n\n💡 Try breaking things down into tiny, microscopic steps. Just focus on the next 5 minutes."
    if emotion == "anxious":
        return "\n\n🌬️ Let's try 4-7-8 breathing together: Inhale for 4 seconds, hold for 7, exhale for 8."
    if emotion == "burnout" or mood == "tired":
        return "\n\n🛌 Recommendation: Drink a glass of water, step away from screens, and rest your eyes for 10 minutes."
    if mood == "sad":
        return "\n\n📓 Journaling prompt: What is one small, gentle thing you can do for yourself today?"
    if mood == "angry":
        return "\n\n🌬️ Ground yourself: Name 3 things you can see right now, and 2 things you can touch."
    if mood == "happy" or mood == "loved":
        return "\n\n✨ Take a mental snapshot of this moment. You deserve this peace."
        
    return ""

# =====================================================================
# PART 8: ADAPTIVE EMOTIONAL ASSESSMENT
# =====================================================================

def evaluate_intensity(user_message: str) -> str:
    """Evaluate emotional intensity based on keywords and syntax."""
    lower_text = user_message.lower()
    high_keywords = ["overwhelmed", "can't handle", "exhausted", "angry", "stressed", "hate", "panic", "drowning", "give up", "breakdown"]
    med_keywords = ["tired", "frustrated", "sad", "annoying", "hard", "struggling", "down"]
    
    if any(kw in lower_text for kw in high_keywords):
        return "high"
    if any(kw in lower_text for kw in med_keywords):
        return "medium"
    return "low"

def ask_followup_question(mood: str) -> str:
    """Ask gentle follow-up questions for distress moods."""
    if mood == "sad":
        return "Do you want to share what made you feel this way?"
    if mood == "angry":
        return "What's been frustrating you the most?"
    if mood == "tired":
        return "Have you been feeling mentally tired or physically?"
    return ""

def decide_breathing_trigger(intensity: str, context: List[Dict[str, str]]) -> str:
    """Determine how to handle the breathing trigger."""
    # Count how many of the last 3 messages were negative
    negative_msgs = [c.get("mood") for c in context[-3:]]
    negative_streak = sum(1 for m in negative_msgs if m in ["sad", "angry", "tired"])
    
    # Trigger automatically if high intensity OR prolonged distress
    if intensity == "high" or negative_streak >= 3:
        return "high"
    if intensity == "medium":
        return "medium"
    return "low"

# =====================================================================
# PART 5 & 7: MAIN CHAT ROUTINE & STABILITY
# =====================================================================

def handle_chat(user_message: str, emoji: str, context: List[Dict[str, str]]) -> Dict[str, Any]:
    """
    Main entry point for AI logic. Completely offline and crash-proof.
    context format expects: [{"user": "hi", "ai": "hello", "mood": "happy"}, ...]
    """
    try:
        # 1. Sanitize inputs
        user_message = str(user_message or "").strip()
        emoji = str(emoji or "").strip()
        context = context[-5:] if isinstance(context, list) else [] # Limit to last 5
        
        # 2. Detect State
        detected_mood = detect_mood_from_emoji(emoji)
        detected_emotion = detect_emotion_from_text(user_message)
        
        # 3. Handle Context Awareness
        previous_moods = [c.get("mood") for c in context if c.get("mood")]
        prefix = _get_contextual_prefix(detected_mood, previous_moods)
        
        # 4. Evaluate Assessment State Machine
        intensity = evaluate_intensity(user_message)
        trigger_state = decide_breathing_trigger(intensity, context)
        action_trigger = None
        
        if trigger_state == "high":
            # Hijack flow for immediate intervention
            core_response = "I'm really glad you told me… let's take a small pause together 💛\nTry this breathing exercise with me."
            action_trigger = "breathing_exercise"
            suffix = ""
            final_response = f"{prefix}{core_response}"
        elif trigger_state == "medium":
            candidates = RESPONSES.get(detected_mood, RESPONSES["neutral"])
            core_response = random.choice(candidates)
            core_response += "\n\nWould you like to try a short breathing exercise together?"
            suffix = ""
            final_response = f"{prefix}{core_response}"
        else:
            # 5. Generate Normal Response
            candidates = RESPONSES.get(detected_mood, RESPONSES["neutral"])
            recent_ai_replies = [c.get("ai", "") for c in context]
            available_responses = [r for r in candidates if not any(r in old_reply for old_reply in recent_ai_replies)]
            
            if not available_responses:
                available_responses = candidates
                
            core_response = random.choice(available_responses)
            
            # Optionally append a follow-up question
            followup = ask_followup_question(detected_mood)
            if followup and "?" not in core_response:
                core_response = f"{core_response} {followup}"
            
            # 6. Add Smart Emotional Coaching & Assemble
            suffix = _get_smart_feature_suffix(detected_mood, detected_emotion)
            final_response = f"{prefix}{core_response}{suffix}"
        
        # 7. Update Context array
        new_context = context + [{
            "user": user_message,
            "ai": final_response,
            "mood": detected_mood,
            "emotion": detected_emotion
        }]
        
        return {
            "mood": detected_mood,
            "emotion": detected_emotion,
            "response": final_response,
            "context": new_context[-5:],
            "action_trigger": action_trigger
        }
        
    except Exception as e:
        # Golden Rule Part 7: NEVER CRASH.
        return {
            "mood": "neutral",
            "emotion": "none",
            "response": "I'm here for you, no matter what. (Fallback mode engaged)",
            "context": context
        }
