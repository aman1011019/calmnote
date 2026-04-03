import { useMemo } from "react";
import { motion } from "framer-motion";
import { getLast7DaysMoods, MoodEntry } from "@/services/storage";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, TooltipProps
} from 'recharts';

const MOOD_COLORS: Record<string, string> = {
  happy: "#FBBF24", // Yellow
  sad: "#60A5FA",   // Blue
  angry: "#F87171", // Red
  tired: "#A78BFA", // Purple
  loved: "#F472B6", // Pink
  neutral: "#9CA3AF" // Gray
};

// Numeric mapping for the line chart (smooth ups/downs representation)
const MOOD_VALUES: Record<string, number> = {
  sad: 1,
  angry: 2,
  tired: 3,
  neutral: 4,
  happy: 5,
  loved: 6
};

// Emoji map for custom tooltips
const EMOJI_MAP: Record<string, string> = {
  happy: "😊",
  neutral: "😐",
  sad: "😢",
  angry: "😡",
  tired: "😴",
  loved: "😍",
};

export default function InsightsScreen() {
  const allMoods = getLast7DaysMoods();

  // 1. Mood Frequency Data (Pie Chart)
  const frequencyData = useMemo(() => {
    const counts: Record<string, number> = {};
    allMoods.forEach(m => {
      counts[m.mood] = (counts[m.mood] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key],
      color: MOOD_COLORS[key] || MOOD_COLORS.neutral
    })).sort((a, b) => b.value - a.value);
  }, [allMoods]);

  // 2. Mood Transitions (Line Chart - Today)
  const todayTransitionsData = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysMoods = allMoods
      .filter(m => m.date === todayStr)
      .sort((a, b) => a.timestamp - b.timestamp);
    
    return todaysMoods.map(m => {
      const dateObj = new Date(m.timestamp);
      return {
        time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: MOOD_VALUES[m.mood] || 4,
        mood: m.mood,
        emoji: m.emoji
      };
    });
  }, [allMoods]);

  // 3. Weekly Timeline Grid
  const weeklyGrid = useMemo(() => {
    const days: { date: string; label: string; entries: MoodEntry[] }[] = [];
    const today = new Date();
    const dayOfWeek = today.getDay(); 
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset);

    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        
        // Filter elements for this day
        const entries = allMoods.filter(m => m.date === dateStr).sort((a, b) => a.timestamp - b.timestamp);
        days.push({ date: dateStr, label: dayLabel, entries });
    }
    return days;
  }, [allMoods]);

  // Custom tooltips
  const CustomPieTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-md border border-border px-3 py-2 rounded-xl shadow-lg">
          <p className="font-display font-bold capitalize text-foreground flex items-center gap-2">
            {EMOJI_MAP[payload[0].payload.name]} {payload[0].payload.name}
          </p>
          <p className="text-sm font-body text-muted-foreground">{payload[0].value} check-ins</p>
        </div>
      );
    }
    return null;
  };

  const CustomLineTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card/95 backdrop-blur-md border border-border px-3 py-2 rounded-xl shadow-lg">
          <p className="text-xs font-body text-muted-foreground mb-1">{data.time}</p>
          <p className="font-display font-bold capitalize text-foreground flex items-center gap-2">
            {data.emoji} {data.mood}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen pb-24 px-6 pt-12 safe-top overflow-y-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-extrabold text-foreground mb-1">Your Insights</h1>
        <p className="text-muted-foreground text-sm font-body mb-8">Understanding your emotional patterns</p>
      </motion.div>

      {allMoods.length === 0 ? (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-10 bg-card rounded-3xl border border-dashed border-border"
        >
          <span className="text-4xl mb-4">🌱</span>
          <h3 className="font-display font-bold text-lg mb-1">No mood data yet</h3>
          <p className="text-muted-foreground text-center text-sm font-body">Log your feelings to see beautiful insights here.</p>
        </motion.div>
      ) : (
        <>
          {/* Section 1: Mood Frequency (Pie Chart) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-3xl p-6 shadow-soft border border-border mb-6"
          >
            <h2 className="text-lg font-display font-bold text-foreground mb-1">Mood Frequency</h2>
            <p className="text-xs text-muted-foreground font-body mb-4">Your most common feelings this week</p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={frequencyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {frequencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomPieTooltip />} cursor={{fill: 'transparent'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend generated manually for clean UI */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                {frequencyData.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                        <span className="text-xs font-body text-card-foreground capitalize">{d.name} ({d.value})</span>
                    </div>
                ))}
            </div>
          </motion.div>

          {/* Section 2: Mood Changes (Line Chart - Transitions) */}
          {todayTransitionsData.length > 1 ? (
             <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="bg-card rounded-3xl p-6 shadow-soft border border-border mb-6"
           >
             <h2 className="text-lg font-display font-bold text-foreground mb-1">Today's Transitions</h2>
             <p className="text-xs text-muted-foreground font-body mb-6">How your mood shifted throughout the day</p>
             <div className="h-48 w-full -ml-3">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={todayTransitionsData}>
                   <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#999'}} dy={10} />
                   <YAxis hide domain={[0, 7]} />
                   <RechartsTooltip content={<CustomLineTooltip />} cursor={{ stroke: 'rgba(0,0,0,0.05)', strokeWidth: 2 }} />
                   <Line
                     type="monotone"
                     dataKey="value"
                     stroke="#6C63FF"
                     strokeWidth={3}
                     dot={{ fill: '#6C63FF', strokeWidth: 2, r: 4 }}
                     activeDot={{ r: 6, fill: '#4A90E2' }}
                   />
                 </LineChart>
               </ResponsiveContainer>
             </div>
           </motion.div>
          ) : (
            <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="bg-card rounded-3xl p-6 shadow-soft border border-border mb-6 flex flex-col items-center py-8"
           >
             <span className="text-3xl mb-2">📈</span>
             <h2 className="text-base font-display font-bold text-foreground">Not Enough Data</h2>
             <p className="text-xs text-center text-muted-foreground font-body mt-1">Log one more mood today to see your transitions line chart!</p>
           </motion.div>
          )}

          {/* Section 3: Weekly Mood Timeline Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-3xl p-6 shadow-soft border border-border mb-6"
          >
            <h2 className="text-lg font-display font-bold text-foreground mb-1">Weekly Pattern</h2>
            <p className="text-xs text-muted-foreground font-body mb-6">Your check-ins mapped over the week</p>
            
            <div className="flex justify-between items-start gap-1">
              {weeklyGrid.map((day, i) => (
                <div key={day.date} className="flex flex-col items-center flex-1 gap-1">
                  {/* Entries column */}
                  <div className="flex flex-col-reverse justify-end items-center min-h-[140px] w-full bg-secondary/30 rounded-full py-2 gap-1.5">
                      {day.entries.length === 0 ? (
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/20 my-auto"></div>
                      ) : (
                          day.entries.map(entry => (
                              <div 
                                key={entry.id} 
                                className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
                                style={{ backgroundColor: MOOD_COLORS[entry.mood] || MOOD_COLORS.neutral }}
                              >
                                  <span className="text-sm">{entry.emoji}</span>
                              </div>
                          ))
                      )}
                  </div>
                  <span className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider mt-2">{day.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
