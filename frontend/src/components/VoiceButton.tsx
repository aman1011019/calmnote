import { motion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";

interface VoiceButtonProps {
  isListening: boolean;
  onClick: () => void;
}

const VoiceButton = ({ isListening, onClick }: VoiceButtonProps) => (
  <motion.button
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`relative p-3 rounded-full transition-colors ${
      isListening ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground'
    }`}
  >
    {isListening && (
      <motion.span
        className="absolute inset-0 rounded-full bg-accent/30"
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    )}
    {isListening ? <MicOff className="w-5 h-5 relative z-10" /> : <Mic className="w-5 h-5" />}
  </motion.button>
);

export default VoiceButton;
