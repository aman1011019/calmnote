import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import DiaryCard from "@/components/DiaryCard";
import { saveDiaryEntry, getDiaryEntries, DiaryEntry } from "@/services/storage";

const moods = [
  { emoji: "😊", mood: "happy" },
  { emoji: "😐", mood: "neutral" },
  { emoji: "😢", mood: "sad" },
  { emoji: "😡", mood: "angry" },
  { emoji: "😴", mood: "tired" },
  { emoji: "😍", mood: "loved" },
];

const DiaryScreen = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>(getDiaryEntries());
  const [isWriting, setIsWriting] = useState(false);
  const [text, setText] = useState("");
  const [selectedMood, setSelectedMood] = useState(moods[0]);

  const handleSave = () => {
    if (!text.trim()) return;
    const entry: DiaryEntry = {
      id: Date.now().toString(),
      text: text.trim(),
      emoji: selectedMood.emoji,
      mood: selectedMood.mood,
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    saveDiaryEntry(entry);
    setEntries(getDiaryEntries());
    setText("");
    setIsWriting(false);
  };

  return (
    <div className="min-h-screen pb-24 px-6 pt-12 safe-top">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-extrabold text-foreground mb-1">My Diary</h1>
        <p className="text-muted-foreground text-sm font-body mb-6">Your private journal • 100% offline</p>
      </motion.div>

      {!isWriting ? (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsWriting(true)}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-display font-semibold mb-6 hover:bg-primary/5 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Write new entry
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-card rounded-2xl p-5 shadow-soft border border-border mb-6"
        >
          <div className="flex gap-2 mb-4">
            {moods.map(m => (
              <button
                key={m.mood}
                onClick={() => setSelectedMood(m)}
                className={`text-2xl p-1.5 rounded-xl transition-colors ${
                  selectedMood.mood === m.mood ? 'bg-primary/15 ring-2 ring-primary' : 'hover:bg-muted'
                }`}
              >
                {m.emoji}
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write about your day..."
            rows={4}
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none font-body"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => { setIsWriting(false); setText(""); }}
              className="flex-1 py-2.5 rounded-xl bg-muted text-muted-foreground font-display font-semibold text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 rounded-xl gradient-calm text-primary-foreground font-display font-semibold text-sm"
            >
              Save Entry
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {entries.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground text-sm py-12 font-body"
          >
            No entries yet. Start writing your thoughts! ✨
          </motion.p>
        ) : (
          entries.map((entry) => (
            <DiaryCard key={entry.id} {...entry} />
          ))
        )}
      </div>
    </div>
  );
};

export default DiaryScreen;
