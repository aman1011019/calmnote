import axios from 'axios';

// IMPORTANT: If running on a physical device, replace localhost with your computer's local IP (e.g., 192.168.1.x)
const API_URL = 'http://localhost:5000';

export async function sendVoiceMessage(
  text: string, 
  mood: string = 'neutral', 
  context: any[] = []
) {
  try {
    const response = await axios.post(`${API_URL}/voice-chat`, {
      text,
      mood,
      context
    });
    return response.data;
  } catch (error) {
    console.error("API Error connecting to Voice Backend:", error);
    return {
       // Safe fallback mechanism if Flask server is down
       response_text: "I'm having trouble connecting to my brain right now...",
       audio_base64: ""
    };
  }
}
