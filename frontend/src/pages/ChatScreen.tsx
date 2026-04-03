import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import ChatBubble from "@/components/ChatBubble";
import VoiceButton from "@/components/VoiceButton";
import { getAIGreeting, speak } from "@/services/ai";
import { ChatMessage, saveChatMessages, getChatMessages, getSettings } from "@/services/storage";
import { startListening, stopListening, isVoiceSupported } from "@/services/speech";

const ChatScreen = () => {
  const location = useLocation();
  const mood = (location.state as any)?.mood || 'neutral';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const settings = getSettings();

  useEffect(() => {
    const saved = getChatMessages();
    if (saved.length > 0) {
      setMessages(saved);
    } else {
      const greeting: ChatMessage = {
        id: Date.now().toString(),
        role: 'ai',
        text: getAIGreeting(mood),
        timestamp: Date.now(),
      };
      setMessages([greeting]);
      if (settings.voiceMode) speak(greeting.text);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    saveChatMessages(messages);
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(async () => {
      try {
        const response = await fetch("http://localhost:8000/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text.trim(), mood })
        });

        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          text: data.response_text,
          timestamp: Date.now(),
          action_trigger: data.action_trigger,
          mood: data.mood
        };

        setMessages(prev => [...prev, aiMsg]);
        setTyping(false);
        if (settings.voiceMode) speak(data.response_text);

      } catch (error) {
        // Fallback safely to static local mock if backend is down
        const { getAIResponse } = await import("@/services/ai");
        const fallbackMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          text: getAIResponse(text.trim(), mood, messages.length),
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, fallbackMsg]);
        setTyping(false);
      }
    }, 800 + Math.random() * 400);
  };

  const handleVoice = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
      return;
    }
    const started = startListening(
      (transcript) => {
        setInput(transcript);
        sendMessage(transcript);
      },
      () => setIsListening(false)
    );
    if (started) setIsListening(true);
  };

  const handleBreathingComplete = () => {
    const aiMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'ai',
      text: "Do you feel a little better now? I'm here if you want to talk more.",
      timestamp: Date.now(),
      mood: mood
    };
    setMessages(prev => [...prev, aiMsg]);
    setTyping(false);
    if (settings.voiceMode) speak(aiMsg.text);
  };

  return (
    <div className="h-screen flex flex-col safe-top">
      {/* Header - Fixed */}
      <div className="shrink-0 px-6 pt-10 pb-4 gradient-calm">
        <h1 className="text-xl font-display font-bold text-primary-foreground">Chat with CalmNote</h1>
        <p className="text-primary-foreground/70 text-xs font-body">Your AI companion • Always here for you</p>
      </div>

      {/* Messages - Scrollable */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((msg, index) => (
          <ChatBubble
            key={msg.id}
            text={msg.text}
            role={msg.role}
            action_trigger={msg.action_trigger}
            mood={msg.mood}
            onBreathingComplete={index === messages.length - 1 ? handleBreathingComplete : undefined}
          />
        ))}
        {typing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 px-4 py-2"
          >
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="w-2 h-2 rounded-full bg-primary/40"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Input - Fixed at bottom */}
      <div className="shrink-0 bg-card/95 backdrop-blur-lg border-t border-border px-4 py-3 mb-16">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          {isVoiceSupported() && (
            <VoiceButton isListening={isListening} onClick={handleVoice} />
          )}
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Type your message..."
            className="flex-1 bg-muted rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-body"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => sendMessage(input)}
            className="p-2.5 rounded-full gradient-calm text-primary-foreground"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
