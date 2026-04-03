import base64
import os
from google.cloud import texttospeech

# Will automatically use GOOGLE_APPLICATION_CREDENTIALS from env
try:
    client = texttospeech.TextToSpeechClient()
except Exception as e:
    print(f"Warning: Google Cloud TTS not configured properly. {e}")
    client = None

def build_ssml(text: str, mood: str) -> str:
    """Build SSML adjusting rate and pitch based on emotional tone."""
    # Sad -> slow, soft
    # Angry -> calm, grounding
    # Tired -> very gentle
    
    rate = "medium"
    pitch = "0st"
    
    if mood == "sad":
        rate = "85%"
        pitch = "-1st"
    elif mood == "angry":
        rate = "90%"
        pitch = "-2st"
    elif mood == "tired":
        rate = "80%"
        pitch = "-1st"

    # Add artificial pauses to commas/periods for a more human feel
    ssml_text = text.replace(".", '. <break time="400ms"/>').replace(",", ', <break time="200ms"/>')
    
    return f'<speak><prosody rate="{rate}" pitch="{pitch}">{ssml_text}</prosody></speak>'

def generate_voice(ssml_text: str) -> str:
    """Pings Google Cloud TTS to synthesize MP3, converts to base64."""
    if not client:
        print("TTS Client not initialized. Returning empty audio.")
        return ""
    
    synthesis_input = texttospeech.SynthesisInput(ssml=ssml_text)
    
    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US", 
        name="en-US-Journey-F", # Natural narrative voices
    )
    
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    try:
        response = client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )
        audio_b64 = base64.b64encode(response.audio_content).decode('utf-8')
        return audio_b64
    except Exception as e:
        print(f"TTS API Error: {e}")
        return ""
