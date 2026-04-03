import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MoodButton from "@/components/MoodButton";
import { saveMood, MoodEntry } from "@/services/storage";

const moods = [
  { emoji: "😊", label: "Happy", mood: "happy" as const },
  { emoji: "😐", label: "Neutral", mood: "neutral" as const },
  { emoji: "😢", label: "Sad", mood: "sad" as const },
  { emoji: "😡", label: "Angry", mood: "angry" as const },
  { emoji: "😴", label: "Tired", mood: "tired" as const },
  { emoji: "😍", label: "Loved", mood: "loved" as const },
];

const HomeScreen = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingMood, setPendingMood] = useState<typeof moods[0] | null>(null);

  const handleMoodSelect = (m: typeof moods[0]) => {
    setSelected(m.mood);

    const entry: MoodEntry = {
      id: Date.now().toString(),
      emoji: m.emoji,
      mood: m.mood,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
    };
    saveMood(entry);

    const distressMoods = ["sad", "angry", "tired"];

    setTimeout(() => {
      if (distressMoods.includes(m.mood)) {
        // Immediate routing for distress
        navigate("/chat", { state: { mood: m.mood, emoji: m.emoji } });
      } else {
        // Show gentle modal for neutral/positive moods
        setPendingMood(m);
        setShowModal(true);
      }
    }, 400);
  };

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen pb-24 px-6 pt-12 safe-top">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <span className="text-3xl block mb-2">👋</span>
        <h1 className="text-2xl font-display font-extrabold text-foreground">{greeting}!</h1>
        <p className="text-muted-foreground font-body mt-1">How are you feeling today?</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-3 max-w-md">
        {moods.map((m, i) => (
          <MoodButton
            key={m.mood}
            emoji={m.emoji}
            label={m.label}
            selected={selected === m.mood}
            onClick={() => handleMoodSelect(m)}
            delay={i * 0.08}
          />
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-xs text-muted-foreground mt-8 font-body"
      >
        Your data never leaves your device 🔒
      </motion.p>

      {/* Gentle Route Modal */}
      <AnimatePresence>
        {showModal && pendingMood && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-card w-full max-w-sm rounded-[32px] p-6 shadow-xl border border-border"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-secondary mx-auto flex items-center justify-center mb-5 text-3xl shadow-inner">
                  {pendingMood.emoji}
                </div>
                <h2 className="text-xl font-display font-bold text-card-foreground mb-2">
                  Would you like to talk with CalmNote AI?
                </h2>
                <p className="text-muted-foreground text-sm mb-8 font-body">
                  Sometimes sharing your thoughts makes the day simply better.
                </p>
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate("/chat", { state: { mood: pendingMood.mood, emoji: pendingMood.emoji } })}
                    className="w-full py-4 rounded-full gradient-calm text-primary-foreground font-semibold shadow-md active:scale-[0.98] transition-all font-body"
                  >
                    Chat Now
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      // Reset visual selection after modal closes
                      setTimeout(() => {
                        setSelected(null);
                        setPendingMood(null);
                      }, 300);
                    }}
                    className="w-full py-4 rounded-full bg-secondary text-secondary-foreground font-semibold active:scale-[0.98] transition-all font-body hover:bg-secondary/80"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeScreen;
