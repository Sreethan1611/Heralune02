import { useEffect, useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Activity, MessageSquare, Target, Bell, TrendingUp, Settings, Wand2, Bot, Plus, Check, X, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CalendarModal } from '../components/ui/CalendarModal';
import { InsightsChatModal } from '../components/ui/InsightsChatModal';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [avatarSeed, setAvatarSeed] = useState('heralune');

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isInsightsChatOpen, setIsInsightsChatOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [journalPlaceholder, setJournalPlaceholder] = useState("What's on your mind right now?");
  const STREAK_COUNT = 12;

  const GUIDED_PROMPTS = [
    "What made you smile today?",
    "What is one thing you can control right now?",
    "Describe a moment of peace you experienced recently.",
    "What are you looking forward to this week?",
    "Write about a small win you had today."
  ];

  const handleSurpriseMe = () => {
    const randomPrompt = GUIDED_PROMPTS[Math.floor(Math.random() * GUIDED_PROMPTS.length)];
    setJournalPlaceholder(randomPrompt);
  };

  const MOOD_DATA = [
    { day: 'Mon', mood: 3, snippet: 'Felt a bit tired but got things done.' },
    { day: 'Tue', mood: 4, snippet: 'Great morning run, feeling energized!' },
    { day: 'Wed', mood: 2, snippet: 'Stressed about the upcoming deadline.' },
    { day: 'Thu', mood: 5, snippet: 'Had a wonderful dinner with friends.' },
    { day: 'Fri', mood: 4, snippet: 'Looking forward to the weekend.' },
    { day: 'Sat', mood: 5, snippet: 'Relaxing day at the park.' },
    { day: 'Sun', mood: 4, snippet: 'Prepped for the week, feeling calm.' }
  ];

  const [focusTasks, setFocusTasks] = useState([
    { id: 1, text: 'Practice 5-minute mindfulness', completed: false },
    { id: 2, text: 'Log evening gratitude', completed: false }
  ]);

  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [newReminderName, setNewReminderName] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');
  const [newReminderDays, setNewReminderDays] = useState<number[]>([0,1,2,3,4,5,6]);
  const [reminders, setReminders] = useState([
    { id: 1, name: 'Evening Check-in', time: '8:30 PM', days: 'Every Day' }
  ]);

  const handleAddReminder = () => {
    if (newReminderName && newReminderTime) {
      // Convert 24h time to 12h for display
      const [hour, min] = newReminderTime.split(':');
      const h = parseInt(hour, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const formattedTime = `${h % 12 || 12}:${min} ${ampm}`;
      
      let dayText = 'Every Day';
      if (newReminderDays.length < 7 && newReminderDays.length > 0) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayText = newReminderDays.map(d => dayNames[d]).join(', ');
      } else if (newReminderDays.length === 0) {
        dayText = 'Never';
      }
      
      setReminders([...reminders, { id: Date.now(), name: newReminderName, time: formattedTime, days: dayText }]);
      setNewReminderName('');
      setNewReminderTime('');
      setNewReminderDays([0,1,2,3,4,5,6]);
      setIsAddingReminder(false);
    }
  };

  const handleDeleteReminder = (id: number) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const toggleReminderDay = (day: number) => {
    if (newReminderDays.includes(day)) {
      setNewReminderDays(newReminderDays.filter(d => d !== day));
    } else {
      setNewReminderDays([...newReminderDays, day].sort());
    }
  };

  const toggleFocusTask = (id: number) => {
    setFocusTasks(tasks => tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

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
      <InsightsChatModal 
        isOpen={isInsightsChatOpen} 
        onClose={() => setIsInsightsChatOpen(false)} 
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
            
            <div className="flex gap-4 mb-4">
              {['😭', '😔', '😐', '🙂', '😄'].map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedMood(emoji)}
                  className={`text-2xl transition-all duration-300 hover:scale-110 ${
                    selectedMood === emoji 
                      ? 'scale-125 drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] filter grayscale-0' 
                      : 'opacity-50 hover:opacity-100 grayscale'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder={journalPlaceholder}
                className="flex-grow bg-black/20 border border-white/10 rounded-xl py-4 px-6 text-white placeholder-white/50 outline-none focus:border-[var(--color-accent-cyan)] transition-colors"
                onClick={() => navigate('/chat')}
              />
              <button 
                onClick={handleSurpriseMe}
                className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[var(--color-accent-purple)] transition-colors flex items-center justify-center"
                title="Surprise me with a prompt"
              >
                <Wand2 size={24} />
              </button>
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

            <GlassCard className="p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 text-[var(--color-accent-cyan)]">
                  <TrendingUp size={24} />
                  <h3 className="text-lg font-semibold text-white">AI Insights</h3>
                </div>
                <button 
                  onClick={() => {
                    console.log('Discuss with AI clicked');
                    setIsInsightsChatOpen(true);
                  }}
                  className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/5"
                >
                  <Bot size={14} /> Discuss
                </button>
              </div>
              <p className="text-white/80 leading-relaxed font-light mb-4">
                We've noticed that journaling after 8 PM correlates with a 30% increase in your reported sleep quality.
              </p>
              <button 
                onClick={() => console.log('Added to focus areas')}
                className="text-xs font-medium text-[var(--color-accent-cyan)] hover:text-white transition-colors flex items-center gap-1"
              >
                + Add to Focus Areas
              </button>
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
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOOD_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="var(--color-accent-cyan)" />
                      <stop offset="100%" stopColor="var(--color-accent-purple)" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                  <YAxis domain={[1, 5]} hide={true} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#1a1a2e] border border-white/10 p-3 rounded-lg shadow-xl max-w-[200px]">
                            <p className="text-white font-medium mb-1">Mood: {payload[0].value}/5</p>
                            <p className="text-white/60 text-xs italic leading-relaxed">"{payload[0].payload.snippet}"</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mood" 
                    stroke="url(#moodGradient)" 
                    strokeWidth={3}
                    dot={{ fill: '#1a1a2e', stroke: 'var(--color-accent-cyan)', strokeWidth: 2, r: 4 }}
                    activeDot={{ fill: 'var(--color-accent-cyan)', stroke: '#fff', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Goals & Recommendations */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4 text-[var(--color-accent-purple)]">
              <Target size={20} />
              <h3 className="text-white font-semibold">Focus Areas</h3>
            </div>
            <div className="flex flex-col gap-3">
              {focusTasks.map(task => (
                <div 
                  key={task.id} 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => toggleFocusTask(task.id)}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                    task.completed 
                      ? 'bg-[var(--color-accent-purple)] border-[var(--color-accent-purple)] scale-110' 
                      : 'border-white/30 group-hover:border-[var(--color-accent-cyan)]'
                  }`}>
                    {task.completed && <Check size={12} className="text-white" />}
                  </div>
                  <span className={`text-sm transition-all duration-300 ${
                    task.completed ? 'text-white/30 line-through' : 'text-white/80'
                  }`}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Reminders */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-pink-400">
                <Bell size={20} />
                <h3 className="text-white font-semibold">Reminders</h3>
              </div>
              <button 
                onClick={() => setIsAddingReminder(!isAddingReminder)}
                className="text-white/50 hover:text-white transition-colors"
              >
                {isAddingReminder ? <X size={18} /> : <Plus size={18} />}
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {reminders.map(reminder => (
                <div key={reminder.id} className="group p-3 bg-black/20 rounded-lg border border-white/5 flex items-center justify-between transition-colors hover:border-white/20">
                  <div>
                    <p className="text-white/80 text-sm font-medium">{reminder.name}</p>
                    <p className="text-white/40 text-xs mt-0.5">{reminder.days}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-white/5 rounded text-xs text-[var(--color-accent-cyan)] border border-white/10">{reminder.time}</span>
                    <button 
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-white hover:bg-red-500 rounded-md transition-all border border-transparent hover:border-red-400/50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {isAddingReminder && (
              <div className="mt-4 p-4 bg-black/20 border border-white/10 rounded-xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 shadow-xl">
                <div>
                  <label className="block text-white/60 text-xs mb-1.5">Reminder Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Morning Journaling" 
                    value={newReminderName}
                    onChange={(e) => setNewReminderName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm outline-none focus:border-[var(--color-accent-purple)] transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-white/60 text-xs mb-1.5">Time</label>
                  <input 
                    type="time" 
                    value={newReminderTime}
                    onChange={(e) => setNewReminderTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-white text-sm outline-none focus:border-[var(--color-accent-purple)] transition-colors [color-scheme:dark]"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-white/60 text-xs">Repeat</label>
                    <button 
                      onClick={() => setNewReminderDays(newReminderDays.length === 7 ? [] : [0,1,2,3,4,5,6])}
                      className="text-[var(--color-accent-cyan)] text-xs font-medium hover:text-white transition-colors"
                    >
                      {newReminderDays.length === 7 ? 'Clear All' : 'Every Day'}
                    </button>
                  </div>
                  <div className="flex justify-between gap-1">
                    {['S','M','T','W','T','F','S'].map((day, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleReminderDay(idx)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                          newReminderDays.includes(idx) 
                            ? 'bg-[var(--color-accent-cyan)]/20 text-[var(--color-accent-cyan)] border border-[var(--color-accent-cyan)]/50' 
                            : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/30'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-white/10">
                  <button 
                    onClick={() => setIsAddingReminder(false)}
                    className="px-4 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddReminder}
                    disabled={!newReminderName || !newReminderTime || newReminderDays.length === 0}
                    className="px-5 py-2 text-xs font-bold bg-[var(--color-accent-cyan)] text-black hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-[0_0_15px_rgba(0,255,255,0.3)]"
                  >
                    Save Alarm
                  </button>
                </div>
              </div>
            )}
          </GlassCard>

        </div>
      </div>
    </div>
  );
}
