import { motion } from "framer-motion";

interface MoodButtonProps {
  emoji: string;
  label: string;
  selected?: boolean;
  onClick: () => void;
  delay?: number;
}

const MoodButton = ({ emoji, label, selected, onClick, delay = 0 }: MoodButtonProps) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 200 }}
    whileHover={{ scale: 1.15 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-colors ${
      selected ? "bg-primary/15 ring-2 ring-primary" : "bg-card hover:bg-muted"
    }`}
  >
    <span className="text-4xl sm:text-5xl">{emoji}</span>
    <span className="text-xs font-display font-semibold text-muted-foreground">{label}</span>
  </motion.button>
);

export default MoodButton;
