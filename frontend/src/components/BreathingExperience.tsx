import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, SkipForward } from "lucide-react";
import { getSettings } from "@/services/storage";

interface BreathingExperienceProps {
  mood?: string;
  onComplete?: () => void;
}

type Phase = "idle" | "inhale" | "hold" | "exhale";

export default function BreathingExperience({ mood = "neutral", onComplete }: BreathingExperienceProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [cycleCount, setCycleCount] = useState(0);
  const isRunningRef = useRef(false);

  // Define configuration based on mood
  const config = useMemo(() => {
    if (mood === "sad") return { title: "Calm", inhale: 4, hold: 0, exhale: 6, cycles: 5, color: "#60A5FA" }; // Soft Blue
    if (mood === "angry") return { title: "Deep Reset", inhale: 4, hold: 4, exhale: 6, cycles: 5, color: "#F87171" }; // Soft Red
    if (mood === "tired") return { title: "Relax", inhale: 3, hold: 0, exhale: 5, cycles: 5, color: "#A78BFA" }; // Soft Purple
    return { title: "Balance", inhale: 4, hold: 0, exhale: 4, cycles: 5, color: "#34D399" }; // Soft Green
  }, [mood]);

  const speakPhase = (text: string) => {
    const { voiceMode } = getSettings();
    if (voiceMode && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const startSession = async () => {
    if (isRunningRef.current) return;
    setIsActive(true);
    isRunningRef.current = true;
    setCycleCount(0);

    for (let i = 0; i < config.cycles; i++) {
      if (!isRunningRef.current) break;
      setCycleCount(i);

      // Inhale
      setPhase("inhale");
      speakPhase("Breathe in slowly...");
      await sleep(config.inhale * 1000);
      if (!isRunningRef.current) break;

      // Hold
      if (config.hold > 0) {
        setPhase("hold");
        speakPhase("Hold gently...");
        await sleep(config.hold * 1000);
        if (!isRunningRef.current) break;
      }

      // Exhale
      setPhase("exhale");
      speakPhase("Breathe out and let go...");
      await sleep(config.exhale * 1000);
      if (!isRunningRef.current) break;
    }

    if (isRunningRef.current) {
      speakPhase("You're doing great. Session complete.");
      setIsActive(false);
      isRunningRef.current = false;
      setPhase("idle");
      if (onComplete) onComplete();
    }
  };

  const stopSession = () => {
    isRunningRef.current = false;
    setIsActive(false);
    setPhase("idle");
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const skipSession = () => {
    stopSession();
    if (onComplete) onComplete();
  };

  // Prevent memory leaks on unmount
  useEffect(() => {
    return () => stopSession();
  }, []);

  // Compute animations
  let targetScale = 1;
  let targetOpacity = 0.2;
  let transitionDuration = 0;
  let label = "Ready?";

  if (phase === "inhale") {
    targetScale = 1.6;
    targetOpacity = 0.8;
    transitionDuration = config.inhale;
    label = "Breathe In";
  } else if (phase === "hold") {
    targetScale = 1.65;
    targetOpacity = 0.9;
    transitionDuration = config.hold;
    label = "Hold";
  } else if (phase === "exhale") {
    targetScale = 1;
    targetOpacity = 0.2;
    transitionDuration = config.exhale;
    label = "Breathe Out";
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 my-4 w-full bg-card rounded-[32px] border border-border overflow-hidden relative shadow-lg">
      
      {/* Background Radial Gradient */}
      <div 
        className="absolute inset-0 opacity-10 blur-3xl pointer-events-none" 
        style={{ backgroundImage: `radial-gradient(circle at center, ${config.color}, transparent 70%)` }}
      />

      <div className="flex flex-col items-center z-10 w-full mb-10 mt-2">
        <h3 className="font-display font-bold text-foreground text-lg">{config.title} Routine</h3>
        {isActive && (
            <p className="text-xs text-muted-foreground font-body font-semibold mt-1">
                Cycle {cycleCount + 1} of {config.cycles}
            </p>
        )}
      </div>

      {/* Breathing Visualizer */}
      <div className="relative w-40 h-40 flex items-center justify-center mb-10">
        
        {/* Expanding Glow Orb */}
        <motion.div
          animate={{ scale: targetScale, opacity: targetOpacity }}
          transition={{ duration: transitionDuration, ease: "easeInOut" }}
          style={{ backgroundColor: config.color }}
          className="absolute w-24 h-24 rounded-full blur-xl"
        />

        {/* Central Physical Orb */}
        <motion.div
          animate={{ scale: isActive ? targetScale * 0.95 : 1 }}
          transition={{ duration: transitionDuration, ease: "easeInOut" }}
          style={{ backgroundColor: config.color }}
          className="absolute w-20 h-20 rounded-full flex items-center justify-center shadow-xl z-10"
        >
          <span className="text-white text-[11px] font-display font-bold uppercase tracking-widest text-center">
            {label}
          </span>
        </motion.div>
        
        {/* Floating Particles (CSS Animation overlay) */}
        {isActive && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, x: (Math.random() - 0.5) * 50 }}
                animate={{ opacity: [0, 0.5, 0], y: -50, x: (Math.random() - 0.5) * 100 }}
                transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                style={{ backgroundColor: config.color }}
                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full blur-sm"
              />
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 z-10 w-full justify-center mt-4">
        {!isActive ? (
          <button
            onClick={startSession}
            className="flex items-center gap-2 py-3 px-6 rounded-full bg-foreground text-background font-semibold shadow-md active:scale-95 transition-transform"
          >
            <Play size={16} fill="currentColor" />
            Start Session
          </button>
        ) : (
          <button
            onClick={stopSession}
            className="flex items-center gap-2 py-3 px-6 rounded-full bg-secondary text-secondary-foreground font-semibold shadow-md active:scale-95 transition-transform"
          >
            <Square size={16} fill="currentColor" />
            Stop
          </button>
        )}

        <button
          onClick={skipSession}
          className="flex items-center gap-2 py-3 px-4 rounded-full bg-transparent text-muted-foreground font-semibold border border-border active:bg-secondary/50 transition-colors"
        >
          <SkipForward size={16} />
          Skip
        </button>
      </div>

    </div>
  );
}
