export interface MoodEntry {
  id: string;
  emoji: string;
  mood: 'happy' | 'neutral' | 'sad' | 'angry' | 'tired' | 'loved';
  timestamp: number;
  date: string; // YYYY-MM-DD
}

export interface DiaryEntry {
  id: string;
  text: string;
  emoji: string;
  mood: string;
  timestamp: number;
  date: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
  action_trigger?: string | null;
  mood?: string;
}

const KEYS = {
  MOODS: 'mindmitra_moods',
  DIARY: 'mindmitra_diary',
  CHAT: 'mindmitra_chat',
  SETTINGS: 'mindmitra_settings',
  SPLASH_SEEN: 'mindmitra_splash_seen',
};

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Mood
export function saveMood(entry: MoodEntry) {
  const moods = get<MoodEntry[]>(KEYS.MOODS, []);
  moods.unshift(entry);
  set(KEYS.MOODS, moods);
}

export function getMoods(): MoodEntry[] {
  return get<MoodEntry[]>(KEYS.MOODS, []);
}

export function getLast7DaysMoods(): MoodEntry[] {
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  return getMoods().filter(m => now - m.timestamp < week);
}

// Diary
export function saveDiaryEntry(entry: DiaryEntry) {
  const entries = get<DiaryEntry[]>(KEYS.DIARY, []);
  entries.unshift(entry);
  set(KEYS.DIARY, entries);
}

export function getDiaryEntries(): DiaryEntry[] {
  return get<DiaryEntry[]>(KEYS.DIARY, []);
}

// Chat
export function saveChatMessages(messages: ChatMessage[]) {
  set(KEYS.CHAT, messages);
}

export function getChatMessages(): ChatMessage[] {
  return get<ChatMessage[]>(KEYS.CHAT, []);
}

export function clearChat() {
  set(KEYS.CHAT, []);
}

// Settings
export interface AppSettings {
  voiceMode: boolean;
  notifications: boolean;
}

export function getSettings(): AppSettings {
  return get<AppSettings>(KEYS.SETTINGS, { voiceMode: false, notifications: true });
}

export function saveSettings(s: AppSettings) {
  set(KEYS.SETTINGS, s);
}

// Splash
export function hasSplashBeenSeen(): boolean {
  return get<boolean>(KEYS.SPLASH_SEEN, false);
}

export function markSplashSeen() {
  set(KEYS.SPLASH_SEEN, true);
}
