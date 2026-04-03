import { motion } from "framer-motion";

interface DiaryCardProps {
  emoji: string;
  text: string;
  date: string;
  mood: string;
}

const DiaryCard = ({ emoji, text, date, mood }: DiaryCardProps) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="bg-card rounded-2xl p-4 shadow-soft border border-border"
  >
    <div className="flex items-center gap-3 mb-2">
      <span className="text-2xl">{emoji}</span>
      <div>
        <span className="text-xs font-display font-semibold text-muted-foreground capitalize">{mood}</span>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
    </div>
    <p className="text-sm text-foreground leading-relaxed line-clamp-3">{text}</p>
  </motion.div>
);

export default DiaryCard;
