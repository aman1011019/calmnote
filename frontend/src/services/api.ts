/**
 * CalmNote API — React Native / Expo client
 *
 * Usage:
 *   import api from './api';
 *   const mood = await api.sendMood('😊');
 *   const reply = await api.sendMessage('I feel great today', 'happy');
 *
 * Install axios first:
 *   npm install axios
 */

import axios, { AxiosResponse } from 'axios';

// ─── Base URL ─────────────────────────────────────────────────────────────────
// Change this to your server IP when running on a physical device.
// Android emulator: use 10.0.2.2 instead of localhost
// iOS simulator / Expo Go on device: use your machine's LAN IP (e.g. 192.168.1.5)
const BASE_URL = 'http://localhost:8000';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Response Types ────────────────────────────────────────────────────────────

export type MoodLabel = 'happy' | 'neutral' | 'sad';

export interface MoodEntry {
  id: number;
  emoji: string;
  mood_label: MoodLabel;
  created_at: string; // ISO 8601
}

export interface ChatReply {
  id: number;
  response_text: string;
  mood: MoodLabel;
  created_at: string;
}

export interface ChatHistoryItem {
  id: number;
  user_message: string;
  ai_response: string;
  mood: MoodLabel;
  created_at: string;
}

export interface DiaryEntry {
  id: number;
  date: string;   // "YYYY-MM-DD"
  mood: MoodLabel;
  text: string;
  created_at: string;
}

export interface MoodInsights {
  period_days: number;
  total_checkins: number;
  mood_counts: { happy: number; neutral: number; sad: number };
  dominant_mood: MoodLabel;
  daily_breakdown: Record<string, MoodLabel[]>;
}

// ─── API Calls ─────────────────────────────────────────────────────────────────

/**
 * POST /mood
 * Log an emoji mood check-in. The server detects the mood label automatically.
 *
 * @param emoji  e.g. "😊"
 */
export async function sendMood(emoji: string): Promise<MoodEntry> {
  const res: AxiosResponse<MoodEntry> = await client.post('/mood', { emoji });
  return res.data;
}

/**
 * GET /mood
 * Retrieve mood history (newest first).
 *
 * @param limit  Max number of entries to return (default 50)
 */
export async function getMoodHistory(limit = 50): Promise<MoodEntry[]> {
  const res: AxiosResponse<MoodEntry[]> = await client.get('/mood', {
    params: { limit },
  });
  return res.data;
}

/**
 * POST /chat
 * Send a message and receive an AI-generated response.
 *
 * @param message  The user's text message
 * @param mood     Current mood context (default "neutral")
 */
export async function sendMessage(
  message: string,
  mood: MoodLabel = 'neutral',
): Promise<ChatReply> {
  const res: AxiosResponse<ChatReply> = await client.post('/chat', {
    message,
    mood,
  });
  return res.data;
}

/**
 * GET /chat/history
 * Retrieve previous chat messages (newest first).
 *
 * @param limit  Max number of messages to return (default 50)
 */
export async function getChatHistory(limit = 50): Promise<ChatHistoryItem[]> {
  const res: AxiosResponse<ChatHistoryItem[]> = await client.get(
    '/chat/history',
    { params: { limit } },
  );
  return res.data;
}

/**
 * POST /diary
 * Save a journal entry.
 *
 * @param date   ISO date string, e.g. "2024-01-15"
 * @param mood   Mood at time of writing
 * @param text   Journal content
 */
export async function saveDiaryEntry(
  date: string,
  mood: MoodLabel,
  text: string,
): Promise<DiaryEntry> {
  const res: AxiosResponse<DiaryEntry> = await client.post('/diary', {
    date,
    mood,
    text,
  });
  return res.data;
}

/**
 * GET /diary
 * Get all saved diary entries (newest first).
 *
 * @param limit  Max entries to return (default 100)
 */
export async function getDiaryEntries(limit = 100): Promise<DiaryEntry[]> {
  const res: AxiosResponse<DiaryEntry[]> = await client.get('/diary', {
    params: { limit },
  });
  return res.data;
}

/**
 * DELETE /diary/:id
 * Delete a diary entry by its ID.
 *
 * @param id  The diary entry ID
 */
export async function deleteDiaryEntry(id: number): Promise<void> {
  await client.delete(`/diary/${id}`);
}

/**
 * GET /insights
 * Retrieve a mood summary for the last 7 days.
 */
export async function getMoodInsights(): Promise<MoodInsights> {
  const res: AxiosResponse<MoodInsights> = await client.get('/insights');
  return res.data;
}

// ─── Default export (convenience object) ─────────────────────────────────────
const api = {
  sendMood,
  getMoodHistory,
  sendMessage,
  getChatHistory,
  saveDiaryEntry,
  getDiaryEntries,
  deleteDiaryEntry,
  getMoodInsights,
};

export default api;
