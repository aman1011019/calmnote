import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import VoiceWave from '../components/VoiceWave';
import { sendVoiceMessage } from '../services/api';

type CallStatus = "Idle" | "Listening..." | "Processing..." | "AI is speaking...";

export default function CallScreen() {
  const [status, setStatus] = useState<CallStatus>("Idle");
  const [aiText, setAiText] = useState("Tap the mic to start our call.");
  const [context, setContext] = useState<any[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Initialize Audio logic
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });
    
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Main interaction loop
  const startCallCycle = async () => {
    setStatus("Listening...");
    
    // In a full production app, you would hook `expo-av` recording here mapped to Whisper STT.
    // For this demonstration loop logic, we simulate the user finishing their sentence after 3s.
    setTimeout(async () => {
      setStatus("Processing...");
      
      // Simulated STT payload
      const userSpoke = "I feel really overwhelmed and exhausted today.";
      const currentMood = "tired";

      // Keep context array short (sliding window pattern)
      setContext(prev => [...prev.slice(-4), { role: "user", content: userSpoke }]);

      // 1. Send to Backend
      const result = await sendVoiceMessage(userSpoke, currentMood, context);
      
      setAiText(result.response_text);
      setContext(prev => [...prev.slice(-4), { role: "assistant", content: result.response_text }]);

      // 2. Play Voice Stream Response
      if (result.audio_base64) {
        setStatus("AI is speaking...");
        playAudio(result.audio_base64);
      } else {
        // Fallback if no audio payload
        setStatus("Idle"); 
      }
    }, 3000);
  };

  const playAudio = async (base64Audio: string) => {
    try {
        // Unload any trailing audio first
      if (sound) await sound.unloadAsync();
      
      const uri = `data:audio/mp3;base64,${base64Audio}`;
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      setSound(newSound);

      // Recursively free the mic up after speech finishes to continue the real-time loop organically!
      newSound.setOnPlaybackStatusUpdate((playbackStatus: any) => {
        if (playbackStatus.didJustFinish) {
          setStatus("Idle");
          newSound.unloadAsync();
          setSound(null);
        }
      });
    } catch (error) {
      console.error("Audio Playback Error:", error);
      setStatus("Idle");
    }
  };

  const endCall = async () => {
    setStatus("Idle");
    setAiText("Call ended.");
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      } catch (e) {}
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CalmNote Voice</Text>
      </View>

      <View style={styles.center}>
        <View style={styles.avatarContainer}>
           <VoiceWave isListening={status === "Listening..." || status === "AI is speaking..."} />
        </View>
        <Text style={styles.status}>{status}</Text>
        <Text style={styles.aiText}>{aiText}</Text>
      </View>

      <View style={styles.controls}>
        {status === "Processing..." ? (
            <ActivityIndicator size="large" color="#6366f1" />
        ) : status === "Idle" ? (
          <TouchableOpacity style={styles.micButton} onPress={startCallCycle}>
            <Text style={styles.micText}>🎤 Talk</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.endButton} onPress={endCall}>
            <Text style={styles.endText}>❌ End Call</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// Minimalist, premium dark-mode styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f8fafc',
    letterSpacing: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  avatarContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#6366f1',
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
  },
  status: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 16,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  aiText: {
    fontSize: 24,
    color: '#f8fafc',
    textAlign: 'center',
    lineHeight: 34,
    opacity: 0.9,
    fontWeight: '500',
  },
  controls: {
    padding: 48,
    alignItems: 'center',
    height: 150,
    justifyContent: 'center',
  },
  micButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 32,
    shadowColor: '#6366f1',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  micText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  endButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 32,
    shadowColor: '#ef4444',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  endText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  }
});
