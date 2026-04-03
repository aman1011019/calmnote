import os
import google.generativeai as genai

# Configure Gemini with environment variable
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

try:
    model = genai.GenerativeModel("gemini-1.5-flash")
except Exception:
    model = None

def generate_ai_response(message: str, mood: str, context: list) -> str:
    if not model:
        return "I'm here for you, but my brain needs a Gemini API key to talk properly."

    prompt = f"""You are a gentle, emotionally intelligent AI companion on a voice call.
The user's current mood is: {mood}.
Context of recent conversation: {context}

User says: {message}

Generate a short, very natural, conversational response (1-3 sentences maximum).
Include natural speech rhythms. Do not use emojis, just plain text that reads well out loud.
If the user is sad, respond softly. If angry, be grounding. If tired, be gentle.
"""
    try:
        response = model.generate_content(prompt)
        # Strip asterisks to prevent reading out markdown
        return response.text.replace("*", "").strip()
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return "I'm listening to you... Please know I'm here."
