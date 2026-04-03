import { useNavigate, useLocation } from "react-router-dom";
import { Home, MessageCircle, BookOpen, BarChart3, Settings } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/chat", icon: MessageCircle, label: "Chat" },
  { path: "/diary", icon: BookOpen, label: "Diary" },
  { path: "/insights", icon: BarChart3, label: "Insights" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/splash") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border safe-bottom z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-0.5 px-3 py-2 relative"
            >
              {active && (
                <motion.span
                  layoutId="tab-indicator"
                  className="absolute top-0 w-8 h-0.5 gradient-calm rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors ${active ? 'text-primary' : 'text-muted-foreground'
                  }`}
              />
              <span className={`text-[10px] font-display font-semibold ${active ? 'text-primary' : 'text-muted-foreground'
                }`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
