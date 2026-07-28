import { useEffect, useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Activity, MessageSquare, Target, Bell, TrendingUp, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CalendarModal } from '../components/ui/CalendarModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [avatarSeed, setAvatarSeed] = useState('heralune');

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const STREAK_COUNT = 12;

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      } else {
        setAvatarSeed(session.user.user_metadata?.avatarSeed || session.user.id || 'heralune');
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return null;

  return (
    <div className="min-h-screen p-6 md:p-12 relative z-10 flex flex-col items-center">
      
      <CalendarModal 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)} 
        streakCount={STREAK_COUNT}
      />

      {/* Header */}
      <header className="w-full max-w-6xl flex justify-between items-center mb-12">
        <div className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <Sparkles className="text-[var(--color-accent-cyan)]" />
          Heralune
        </div>
        
        <div className="hidden md:flex items-center gap-8 bg-black/20 px-6 py-2 rounded-full border border-white/5 backdrop-blur-md">
          <button className="text-white font-medium hover:text-[var(--color-accent-cyan)] transition-colors" onClick={() => navigate('/dashboard')}>Home</button>
          <button className="text-white/60 font-medium hover:text-[var(--color-accent-cyan)] transition-colors" onClick={() => navigate('/analytics')}>Analytics</button>
        </div>

        <div className="relative">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} 
            alt="Profile" 
            className="w-10 h-10 rounded-full border border-white/20 bg-black/20 cursor-pointer hover:border-white/40 transition-colors"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
              <button 
                className="w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                onClick={() => navigate('/profile')}
              >
                Profile
              </button>
              <button 
                className="w-full text-left px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                onClick={() => navigate('/settings')}
              >
                <Settings size={16} className="opacity-70" /> Settings
              </button>
              <button 
                className="w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors border-t border-white/5"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Grid Layout */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column (Main) */}
        <div className="md:col-span-8 flex flex-col gap-6">
          
          {/* Welcome & Quick Journal */}
          <GlassCard className="p-8" intensity="heavy">
            <h1 className="text-3xl font-bold text-white mb-2">Good afternoon.</h1>
            <p className="text-white/70 mb-6">Take a moment to reflect on your day.</p>
            
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="What's on your mind right now?"
                className="flex-grow bg-black/20 border border-white/10 rounded-xl py-4 px-6 text-white placeholder-white/50 outline-none focus:border-[var(--color-accent-cyan)] transition-colors"
                onClick={() => navigate('/chat')}
              />
              <GlassButton onClick={() => navigate('/chat')} className="px-8">
                Journal
              </GlassButton>
            </div>
          </GlassCard>

          {/* Today's Summary & AI Insights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4 text-[var(--color-accent-purple)]">
                <Activity size={24} />
                <h3 className="text-lg font-semibold text-white">Today's Summary</h3>
              </div>
              <p className="text-white/80 leading-relaxed font-light">
                You've been experiencing a mix of calm and focused energy today. Your morning journaling indicated positive anticipation.
              </p>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4 text-[var(--color-accent-cyan)]">
                <TrendingUp size={24} />
                <h3 className="text-lg font-semibold text-white">AI Insights</h3>
              </div>
              <p className="text-white/80 leading-relaxed font-light">
                We've noticed that journaling after 8 PM correlates with a 30% increase in your reported sleep quality.
              </p>
            </GlassCard>
          </div>

          {/* Recent Conversations */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-pink-400">
                <MessageSquare size={24} />
                <h3 className="text-lg font-semibold text-white">Recent Reflections</h3>
              </div>
              <button className="text-white/50 hover:text-white text-sm transition-colors">View All</button>
            </div>
            
            <div className="flex flex-col gap-3">
              {[
                { title: "Processing work anxiety", date: "Today, 10:45 AM", mood: "Anxious" },
                { title: "Gratitude for the weekend", date: "Yesterday, 8:00 PM", mood: "Peaceful" },
                { title: "Navigating conflict with a friend", date: "Oct 12, 3:30 PM", mood: "Stressed" },
              ].map((conv, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => navigate('/chat')}>
                  <div>
                    <h4 className="text-white font-medium">{conv.title}</h4>
                    <p className="text-white/50 text-sm mt-1">{conv.date}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm border border-white/10">
                    {conv.mood}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

        {/* Right Column (Sidebar) */}
        <div className="md:col-span-4 flex flex-col gap-6">
          
          {/* Streak */}
          <div className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]" onClick={() => setIsCalendarOpen(true)}>
            <GlassCard className="p-6 flex items-center justify-between border-[var(--color-accent-purple)]/30 hover:border-[var(--color-accent-cyan)]/50 transition-colors">
              <div>
                <h3 className="text-white font-semibold mb-1">Current Streak</h3>
                <p className="text-[var(--color-accent-cyan)] text-sm font-medium">Click to view calendar</p>
              </div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-purple)] to-[var(--color-accent-cyan)]">
                {STREAK_COUNT}
              </div>
            </GlassCard>
          </div>

          {/* Mood Graph Placeholder */}
          <GlassCard className="p-6">
            <h3 className="text-white font-semibold mb-4">Weekly Mood</h3>
            <div className="h-40 w-full bg-black/20 rounded-lg flex items-center justify-center border border-white/5">
              <p className="text-white/30 text-sm">Chart Data (Phase 6)</p>
            </div>
          </GlassCard>

          {/* Goals & Recommendations */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4 text-[var(--color-accent-purple)]">
              <Target size={20} />
              <h3 className="text-white font-semibold">Focus Areas</h3>
            </div>
            <ul className="flex flex-col gap-3">
              <li className="flex items-center gap-3 text-white/80 text-sm">
                <div className="w-2 h-2 rounded-full bg-[var(--color-accent-cyan)]"></div>
                Practice 5-minute mindfulness
              </li>
              <li className="flex items-center gap-3 text-white/80 text-sm">
                <div className="w-2 h-2 rounded-full bg-[var(--color-accent-purple)]"></div>
                Log evening gratitude
              </li>
            </ul>
          </GlassCard>

          {/* Reminders */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4 text-pink-400">
              <Bell size={20} />
              <h3 className="text-white font-semibold">Reminders</h3>
            </div>
            <div className="p-3 bg-black/20 rounded-lg border border-white/5">
              <p className="text-white/80 text-sm font-medium mb-1">Evening Check-in</p>
              <p className="text-white/50 text-xs">Scheduled for 8:30 PM</p>
            </div>
          </GlassCard>

        </div>
      </div>
    </div>
  );
}
