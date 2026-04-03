from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_service import generate_ai_response
from voice_service import build_ssml, generate_voice

app = Flask(__name__)
# Allow Expo local networks to access the API
CORS(app)

@app.route('/voice-chat', methods=['POST'])
def voice_chat():
    data = request.json
    if not data:
        return jsonify({"error": "No JSON payload provided"}), 400
        
    text = data.get("text", "").strip()
    mood = data.get("mood", "neutral")
    context = data.get("context", [])
    
    # Handle empty text edge-case
    if not text:
         return jsonify({
            "response_text": "I'm listening, please go ahead.",
            "audio_base64": ""
         })
         
    # 1. Generate human-like text via Gemini (AI SERVICE)
    response_text = generate_ai_response(text, mood, context)
    
    # 2. Extract emotion into prosody pacing (SSML BUILDER)
    ssml = build_ssml(response_text, mood)
    
    # 3. Generate MP3 Audio via Google TTS (VOICE SERVICE)
    audio_b64 = generate_voice(ssml)
    
    return jsonify({
         "response_text": response_text,
         "audio_base64": audio_b64
    })

if __name__ == '__main__':
    print("🚀 Real-Time Voice Backend running on port 5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
