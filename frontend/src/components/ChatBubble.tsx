import { motion } from "framer-motion";
import BreathingExperience from "./BreathingExperience";

interface ChatBubbleProps {
  text: string;
  role: 'user' | 'ai';
  action_trigger?: string | null;
  mood?: string;
  onBreathingComplete?: () => void;
}

const ChatBubble = ({ text, role, action_trigger, mood, onBreathingComplete }: ChatBubbleProps) => {
  const isAI = role === 'ai';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-3`}
    >
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${isAI
            ? 'bg-secondary text-secondary-foreground rounded-bl-sm'
            : 'gradient-calm text-primary-foreground rounded-br-sm'
          }`}
      >
        {isAI && <span className="text-xs font-display font-bold block mb-1 opacity-70">CalmNote AI</span>}
        <div className="whitespace-pre-wrap">{text}</div>
        {action_trigger === "breathing_exercise" && (
            <BreathingExperience mood={mood} onComplete={onBreathingComplete} />
        )}
      </div>
    </motion.div>
  );
};

export default ChatBubble;
