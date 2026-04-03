/**
 * CalmNote — Frontend API Integration Examples
 * ─────────────────────────────────────────────
 * This file shows how to use every api.ts function inside React / React Native
 * components. Copy-paste any example into your actual screen files.
 *
 * All examples use:
 *   - React hooks (useState, useEffect, useCallback)
 *   - Proper loading / error state handling
 *   - The ApiClientError type for typed error messages
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import {
  // API functions
  sendMood,
  sendMessage,
  saveDiaryEntry,
  getDiaryEntries,
  deleteDiaryEntry,
  getMoodInsights,
  getChatHistory,
  // Types
  MoodLabel,
  MoodEntry,
  ChatReply,
  DiaryEntry,
  MoodInsights,
} from "./api";

// Helper type for errors until we update api.ts to include it
export interface ApiClientError extends Error {
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 1: Mood Check-In Button
// ─────────────────────────────────────────────────────────────────────────────
export function MoodCheckIn() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MoodEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  const logMood = async (emoji: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sendMood(emoji);
      setResult(res);
    } catch (err) {
      const e = err as ApiClientError;
      setError(e.message); // friendly message from interceptor
    } finally {
      setLoading(false);
    }
  };

  const EMOJIS = ["😊", "😄", "😢", "😭", "😔", "😐", "🥰", "😩"];

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>How are you feeling?</Text>

      <View style={styles.emojiRow}>
        {EMOJIS.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            onPress={() => logMood(emoji)}
            style={styles.emojiBtn}
            disabled={loading}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && <ActivityIndicator color="#6366f1" />}

      {result && (
        <Text style={styles.success}>
          Logged {result.emoji} — feeling {result.mood_label} ✓
        </Text>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 2: AI Chat Component
// ─────────────────────────────────────────────────────────────────────────────
export function ChatWidget({ currentMood = "neutral" }: { currentMood?: MoodLabel }) {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<ChatReply | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    setReply(null);

    try {
      const res = await sendMessage(message.trim(), currentMood);
      setReply(res);
      setMessage("");
    } catch (err) {
      const e = err as ApiClientError;
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Talk to CalmNote 🧘</Text>

      <TextInput
        style={styles.input}
        value={message}
        onChangeText={setMessage}
        placeholder="Type how you're feeling..."
        multiline
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSend}
        disabled={loading || !message.trim()}
      >
        <Text style={styles.buttonText}>{loading ? "Thinking..." : "Send"}</Text>
      </TouchableOpacity>

      {reply && (
        <View style={styles.replyBubble}>
          <Text style={styles.replyText}>{reply.response_text}</Text>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 3: Diary List with Save & Delete
// ─────────────────────────────────────────────────────────────────────────────
export function DiaryScreen() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [text, setText] = useState("");
  const [mood, setMood] = useState<MoodLabel>("neutral");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDiaryEntries();
      setEntries(data);
    } catch (err) {
      setError((err as ApiClientError).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await saveDiaryEntry(today, mood, text.trim());
      setText("");
      await fetchEntries(); // refresh list
    } catch (err) {
      setError((err as ApiClientError).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDiaryEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      Alert.alert("Error", (err as ApiClientError).message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Journal 📓</Text>

      {/* New entry form */}
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={text}
        onChangeText={setText}
        placeholder="Write about your day..."
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? "Saving..." : "Save Entry"}</Text>
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}

      {/* Diary list */}
      {loading ? (
        <ActivityIndicator color="#6366f1" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.diaryItem}>
              <Text style={styles.diaryDate}>
                {item.date} — {item.mood}
              </Text>
              <Text style={styles.diaryText}>{item.text}</Text>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteBtn}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 4: Mood Insights Dashboard
// ─────────────────────────────────────────────────────────────────────────────
export function InsightsDashboard() {
  const [insights, setInsights] = useState<MoodInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMoodInsights()
      .then(setInsights)
      .catch((err: ApiClientError) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#6366f1" style={{ marginTop: 40 }} />;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!insights) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>📊 Last 7 Days</Text>

      <Text style={styles.label}>
        Dominant mood:{" "}
        <Text style={styles.highlight}>{insights.dominant_mood}</Text>
      </Text>

      <Text style={styles.label}>Total check-ins: {insights.total_checkins}</Text>

      <View style={styles.moodRow}>
        <Text style={styles.moodBadge}>😊 {insights.mood_counts.happy}</Text>
        <Text style={styles.moodBadge}>😐 {insights.mood_counts.neutral}</Text>
        <Text style={styles.moodBadge}>😢 {insights.mood_counts.sad}</Text>
      </View>

      <Text style={styles.label}>Daily breakdown:</Text>
      {Object.entries(insights.daily_breakdown).map(([date, moods]) => (
        <Text key={date} style={styles.day}>
          {date}: {moods.join(", ")}
        </Text>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE 5: Chat History List
// ─────────────────────────────────────────────────────────────────────────────
export function ChatHistoryScreen() {
  const [history, setHistory] = useState<
    Awaited<ReturnType<typeof getChatHistory>>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getChatHistory(20)
      .then(setHistory)
      .catch((err: ApiClientError) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator color="#6366f1" />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <FlatList
      data={history}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <View style={styles.chatItem}>
          <Text style={styles.userMsg}>You: {item.user_message}</Text>
          <Text style={styles.aiMsg}>🧘 {item.ai_response}</Text>
          <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleString()}</Text>
        </View>
      )}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Minimal shared styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#0f0f13" },
  card: {
    backgroundColor: "#1c1c28",
    borderRadius: 16,
    padding: 20,
    margin: 12,
  },
  heading: { fontSize: 18, fontWeight: "700", color: "#e2e8f0", marginBottom: 12 },
  label: { color: "#94a3b8", marginTop: 8, fontSize: 14 },
  highlight: { color: "#818cf8", fontWeight: "600" },
  emojiRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  emojiBtn: { padding: 8, borderRadius: 12, backgroundColor: "#2d2d3f" },
  emoji: { fontSize: 28 },
  input: {
    backgroundColor: "#2d2d3f",
    borderRadius: 12,
    padding: 12,
    color: "#e2e8f0",
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#6366f1",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "600" },
  replyBubble: {
    backgroundColor: "#2d2d3f",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  replyText: { color: "#c4b5fd", fontSize: 14, lineHeight: 20 },
  success: { color: "#4ade80", marginTop: 8, fontSize: 13 },
  error: { color: "#f87171", marginTop: 8, fontSize: 13 },
  diaryItem: {
    backgroundColor: "#2d2d3f",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  diaryDate: { color: "#818cf8", fontSize: 12, marginBottom: 4 },
  diaryText: { color: "#e2e8f0", fontSize: 14 },
  deleteBtn: { color: "#f87171", fontSize: 12, marginTop: 8 },
  moodRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  moodBadge: {
    color: "#e2e8f0",
    backgroundColor: "#2d2d3f",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 14,
  },
  day: { color: "#64748b", fontSize: 12, marginTop: 4 },
  chatItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2d2d3f",
  },
  userMsg: { color: "#e2e8f0", fontSize: 14 },
  aiMsg: { color: "#c4b5fd", fontSize: 14, marginTop: 4 },
  timestamp: { color: "#475569", fontSize: 11, marginTop: 4 },
});
