import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Volume2, Bell, Heart, Trash2 } from "lucide-react";
import { getSettings, saveSettings, clearChat } from "@/services/storage";

const SettingsScreen = () => {
  const [settings, setSettings] = useState(getSettings());

  const toggle = (key: 'voiceMode' | 'notifications') => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    saveSettings(updated);
  };

  return (
    <div className="min-h-screen pb-24 px-6 pt-12 safe-top">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-extrabold text-foreground mb-1">Settings</h1>
        <p className="text-muted-foreground text-sm font-body mb-8">Customize your experience</p>
      </motion.div>

      {/* Privacy badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="gradient-calm rounded-2xl p-5 mb-6 flex items-center gap-4"
      >
        <Shield className="w-8 h-8 text-primary-foreground flex-shrink-0" />
        <div>
          <h2 className="text-sm font-display font-bold text-primary-foreground">Privacy First</h2>
          <p className="text-xs text-primary-foreground/80 font-body mt-0.5">
            Your data never leaves your device 🔒
          </p>
        </div>
      </motion.div>

      <div className="space-y-3">
        {/* Voice mode */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-4 shadow-soft border border-border flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-display font-semibold text-foreground">Voice Mode</p>
              <p className="text-xs text-muted-foreground font-body">AI reads responses aloud</p>
            </div>
          </div>
          <button
            onClick={() => toggle('voiceMode')}
            className={`w-12 h-7 rounded-full transition-colors flex items-center px-0.5 ${settings.voiceMode ? 'bg-primary justify-end' : 'bg-muted justify-start'
              }`}
          >
            <motion.span
              layout
              className="w-6 h-6 rounded-full bg-card shadow-sm"
            />
          </button>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-4 shadow-soft border border-border flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-display font-semibold text-foreground">Notifications</p>
              <p className="text-xs text-muted-foreground font-body">Daily mood check-in reminder</p>
            </div>
          </div>
          <button
            onClick={() => toggle('notifications')}
            className={`w-12 h-7 rounded-full transition-colors flex items-center px-0.5 ${settings.notifications ? 'bg-primary justify-end' : 'bg-muted justify-start'
              }`}
          >
            <motion.span
              layout
              className="w-6 h-6 rounded-full bg-card shadow-sm"
            />
          </button>
        </motion.div>

        {/* Clear chat */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => { clearChat(); }}
          className="w-full bg-card rounded-2xl p-4 shadow-soft border border-border flex items-center gap-3 hover:bg-destructive/5 transition-colors"
        >
          <Trash2 className="w-5 h-5 text-destructive" />
          <div className="text-left">
            <p className="text-sm font-display font-semibold text-foreground">Clear Chat History</p>
            <p className="text-xs text-muted-foreground font-body">Start fresh with CalmNote</p>
          </div>
        </motion.button>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-12 text-center"
      >
        <Heart className="w-5 h-5 text-accent mx-auto mb-2" />
        <p className="text-xs text-muted-foreground font-body">
          Made with love for your wellbeing
        </p>
        <p className="text-xs text-muted-foreground/60 font-body mt-1">CalmNote v1.0</p>
      </motion.div>
    </div>
  );
};

export default SettingsScreen;
