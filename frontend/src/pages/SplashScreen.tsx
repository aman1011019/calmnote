import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { hasSplashBeenSeen, markSplashSeen } from "@/services/storage";

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (hasSplashBeenSeen()) {
      navigate("/", { replace: true });
      return;
    }
    const timer = setTimeout(() => {
      markSplashSeen();
      navigate("/", { replace: true });
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-calm relative overflow-hidden">
      {/* Floating orbs */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-soft-pink/20 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        style={{ top: '10%', left: '10%' }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full bg-soft-blue/20 blur-3xl"
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        style={{ bottom: '20%', right: '10%' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center relative z-10"
      >
        <motion.span
          className="text-7xl block mb-6"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🧠
        </motion.span>
        <h1 className="text-4xl font-display font-extrabold text-primary-foreground mb-3">
          MindMitra
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-primary-foreground/80 font-body text-lg"
        >
          Your safe space to feel and heal
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-12"
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-primary-foreground/50"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
