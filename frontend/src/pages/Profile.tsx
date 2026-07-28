import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, Settings, User, Bell, Shield, Moon } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      } else {
        setEmail(session.user.email || '');
      }
    };
    fetchUser();
  }, [navigate]);

  return (
    <div className="min-h-screen p-4 md:p-8 relative z-10 flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <GlassButton variant="ghost" onClick={() => navigate('/dashboard')} className="!p-2 text-white/60 hover:text-white">
            <ArrowLeft size={20} />
          </GlassButton>
          <div className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="text-[var(--color-accent-cyan)]" size={24} />
            Settings & Profile
          </div>
        </div>
      </header>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sidebar */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <GlassCard className="p-4 flex flex-col gap-2">
            <button className="flex items-center gap-3 text-white bg-white/10 p-3 rounded-lg text-left">
              <User size={18} /> Account
            </button>
            <button className="flex items-center gap-3 text-white/60 hover:text-white hover:bg-white/5 p-3 rounded-lg text-left transition-colors">
              <Bell size={18} /> Notifications
            </button>
            <button className="flex items-center gap-3 text-white/60 hover:text-white hover:bg-white/5 p-3 rounded-lg text-left transition-colors">
              <Shield size={18} /> Privacy
            </button>
            <button className="flex items-center gap-3 text-white/60 hover:text-white hover:bg-white/5 p-3 rounded-lg text-left transition-colors">
              <Moon size={18} /> Appearance
            </button>
          </GlassCard>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <GlassCard className="p-8" intensity="heavy">
            <h3 className="text-xl font-bold text-white mb-6">Account Details</h3>
            
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-6">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=heralune`} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full border-2 border-white/20 bg-black/20"
                />
                <div>
                  <GlassButton variant="secondary">Change Avatar</GlassButton>
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  disabled
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white/50 outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Preferred Name / Nickname</label>
                <input 
                  type="text" 
                  placeholder="How should Heralune call you?"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-[var(--color-accent-cyan)]"
                />
              </div>

              <GlassButton className="w-full sm:w-auto mt-4">Save Changes</GlassButton>
            </div>
          </GlassCard>

          <GlassCard className="p-8 border-red-500/30">
            <h3 className="text-xl font-bold text-red-400 mb-2">Danger Zone</h3>
            <p className="text-white/60 text-sm mb-6">Permanently delete your account and all journaling data.</p>
            <GlassButton variant="secondary" className="!text-red-400 !border-red-500/30 hover:!bg-red-500/20">
              Delete Account
            </GlassButton>
          </GlassCard>
        </div>

      </div>

    </div>
  );
}
