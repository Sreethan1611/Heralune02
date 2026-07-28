import { useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart2, TrendingUp, Calendar, Heart, Activity, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { supabase } from '../lib/supabase';

const mockMoodData = [
  { name: 'Mon', mood: 6, anxiety: 4 },
  { name: 'Tue', mood: 7, anxiety: 3 },
  { name: 'Wed', mood: 5, anxiety: 6 },
  { name: 'Thu', mood: 8, anxiety: 2 },
  { name: 'Fri', mood: 9, anxiety: 1 },
  { name: 'Sat', mood: 8, anxiety: 2 },
  { name: 'Sun', mood: 9, anxiety: 1 },
];

export default function Analytics() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/auth');
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen p-4 md:p-8 relative z-10 flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full max-w-6xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <GlassButton variant="ghost" onClick={() => navigate('/dashboard')} className="!p-2 text-white/60 hover:text-white">
            <ArrowLeft size={20} />
          </GlassButton>
          <div className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart2 className="text-[var(--color-accent-purple)]" size={24} />
            Your Analytics
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        
        {/* KPI Cards */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 text-pink-400 mb-2">
            <Heart size={20} />
            <h3 className="text-white font-medium">Average Mood</h3>
          </div>
          <p className="text-4xl font-bold text-white">7.4</p>
          <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
            <TrendingUp size={14} /> +12% from last week
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 text-[var(--color-accent-cyan)] mb-2">
            <Activity size={20} />
            <h3 className="text-white font-medium">Total Entries</h3>
          </div>
          <p className="text-4xl font-bold text-white">42</p>
          <p className="text-white/50 text-sm mt-2 flex items-center gap-1">
            <Calendar size={14} /> 5 entries this week
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-3 text-[var(--color-accent-purple)] mb-2">
            <Sparkles size={20} />
            <h3 className="text-white font-medium">Emotional Range</h3>
          </div>
          <p className="text-4xl font-bold text-white">Broad</p>
          <p className="text-white/50 text-sm mt-2">
            Experiencing diverse emotional states
          </p>
        </GlassCard>

      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Trend Chart */}
        <GlassCard className="p-6" intensity="heavy">
          <h3 className="text-xl font-bold text-white mb-6">Weekly Mood Trend</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockMoodData}>
                <defs>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-accent-cyan)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-accent-cyan)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="mood" stroke="var(--color-accent-cyan)" fillOpacity={1} fill="url(#colorMood)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Anxiety vs Mood Chart */}
        <GlassCard className="p-6" intensity="heavy">
          <h3 className="text-xl font-bold text-white mb-6">Mood vs Stress Levels</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockMoodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="mood" stroke="var(--color-accent-cyan)" strokeWidth={2} />
                <Line type="monotone" dataKey="anxiety" stroke="var(--color-accent-purple)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

    </div>
  );
}
