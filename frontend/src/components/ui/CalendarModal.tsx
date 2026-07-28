import React from 'react';
import { X, Calendar as CalendarIcon, Flame } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakCount: number;
}

// Generate mock data for the last 30 days
const generateMockHeatmap = () => {
  const days = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // Randomly assign 0-3 entries for the mock data, heavily weighting 1 and 0
    const randomVal = Math.random();
    let count = 0;
    if (randomVal > 0.8) count = 2;
    else if (randomVal > 0.4) count = 1;
    else if (randomVal > 0.95) count = 3;

    days.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count
    });
  }
  return days;
};

export const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose, streakCount }) => {
  if (!isOpen) return null;

  const heatmapData = generateMockHeatmap();

  // Helper to determine tailwind background color based on entry count
  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-white/5 border border-white/5';
    if (count === 1) return 'bg-[var(--color-accent-cyan)] opacity-40';
    if (count === 2) return 'bg-[var(--color-accent-cyan)] opacity-70';
    return 'bg-[var(--color-accent-cyan)] opacity-100 shadow-[0_0_10px_var(--color-accent-cyan)]';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <GlassCard className="relative w-full max-w-2xl p-8 animate-in fade-in zoom-in duration-200" intensity="heavy">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-8">
          <CalendarIcon className="text-[var(--color-accent-purple)]" size={28} />
          <h2 className="text-2xl font-bold text-white">Your Journaling Activity</h2>
        </div>

        {/* Stats Row */}
        <div className="flex gap-8 mb-8 pb-8 border-b border-white/10">
          <div>
            <p className="text-white/50 text-sm mb-1 uppercase tracking-wider font-semibold">Current Streak</p>
            <div className="flex items-center gap-2">
              <Flame className="text-orange-400" size={24} />
              <span className="text-3xl font-bold text-white">{streakCount} Days</span>
            </div>
          </div>
          <div>
            <p className="text-white/50 text-sm mb-1 uppercase tracking-wider font-semibold">Total Entries (30 Days)</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-white">
                {heatmapData.reduce((acc, day) => acc + day.count, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div>
          <h3 className="text-white/80 font-medium mb-4">Last 30 Days</h3>
          
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {heatmapData.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1 group">
                <div 
                  className={`w-full aspect-square rounded-md transition-all duration-300 ${getHeatmapColor(day.count)} group-hover:scale-110`}
                  title={`${day.count} entries on ${day.date}`}
                />
                <span className="text-[10px] text-white/30 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap absolute -bottom-4 bg-black/80 px-2 py-1 rounded">
                  {day.date}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 mt-6 text-xs text-white/50">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-white/5 border border-white/5" />
            <div className="w-3 h-3 rounded-sm bg-[var(--color-accent-cyan)] opacity-40" />
            <div className="w-3 h-3 rounded-sm bg-[var(--color-accent-cyan)] opacity-70" />
            <div className="w-3 h-3 rounded-sm bg-[var(--color-accent-cyan)] opacity-100" />
            <span>More</span>
          </div>
        </div>

      </GlassCard>
    </div>
  );
};
