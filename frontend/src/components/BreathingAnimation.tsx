import { motion } from "framer-motion";

export default function BreathingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center p-6 my-4 w-full bg-background rounded-3xl border border-border overflow-hidden">
      <h3 className="font-display font-bold text-foreground mb-8">Let's breathe together</h3>
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Expanding Ring */}
        <motion.div
          animate={{
            scale: [1, 2.2, 1],
            opacity: [0.3, 0.05, 0.3],
          }}
          transition={{
            duration: 8, // 4s inhale, 4s exhale
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-primary/40 rounded-full"
        />
        {/* Core Dot */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-16 h-16 bg-primary rounded-full shadow-lg shadow-primary/30 flex items-center justify-center z-10"
        >
          <span className="text-primary-foreground text-[10px] font-bold uppercase tracking-widest text-center">
            Inhale<br/>Exhale
          </span>
        </motion.div>
      </div>
      <p className="text-xs font-body text-muted-foreground mt-10 text-center max-w-[200px]">
        Follow the circle. <br/>Inhale as it expands, exhale as it shrinks.
      </p>
    </div>
  );
}
