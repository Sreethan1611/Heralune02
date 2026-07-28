import { useEffect, useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, Bell, Shield, Moon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Toggle } from '../components/ui/Toggle';

type Tab = 'notifications' | 'privacy' | 'appearance';

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('notifications');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Preferences State
  const [dailyReminder, setDailyReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [aiAnalysis, setAiAnalysis] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [optOut, setOptOut] = useState(false);
  const [useRegisteredEmail, setUseRegisteredEmail] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      } else {
        setEmail(session.user.email || '');
        const meta = session.user.user_metadata;
        
        if (meta?.preferences) {
          setDailyReminder(meta.preferences.dailyReminder ?? true);
          setReminderTime(meta.preferences.reminderTime ?? '20:00');
          setAiAnalysis(meta.preferences.aiAnalysis ?? true);
          setReduceMotion(meta.preferences.reduceMotion ?? false);
          setTheme(meta.preferences.theme ?? 'dark');
          setOptOut(meta.preferences.optOut ?? false);
          setUseRegisteredEmail(meta.preferences.useRegisteredEmail ?? true);
        }
      }
    };
    fetchUser();
  }, [navigate]);

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      // Need to preserve nickname and avatarSeed since they are in user_metadata
      const { data: { user } } = await supabase.auth.getUser();
      const currentMeta = user?.user_metadata || {};
      
      const preferences = { dailyReminder, reminderTime, aiAnalysis, reduceMotion, theme, optOut, useRegisteredEmail };
      const { error } = await supabase.auth.updateUser({
        data: { ...currentMeta, preferences }
      });
      if (error) throw error;
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage('Error updating settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => alert("Account deletion is protected. Please contact support.");

  const renderTabButton = (tabId: Tab, icon: any, label: string) => {
    const isActive = activeTab === tabId;
    return (
      <button 
        onClick={() => setActiveTab(tabId)}
        className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${isActive ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
      >
        {icon} {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-8 relative z-10 flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <GlassButton variant="ghost" onClick={() => navigate('/dashboard')} className="!p-2 text-white/60 hover:text-white">
            <ArrowLeft size={20} />
          </GlassButton>
          <div className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <SettingsIcon className="text-[var(--color-accent-cyan)]" size={24} />
            Settings
          </div>
        </div>
      </header>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sidebar */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <GlassCard className="p-4 flex flex-col gap-2">
            {renderTabButton('notifications', <Bell size={18} />, 'Notifications')}
            {renderTabButton('privacy', <Shield size={18} />, 'Privacy')}
            {renderTabButton('appearance', <Moon size={18} />, 'Appearance')}
          </GlassCard>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <GlassCard className="p-8" intensity="heavy">
            
            {message && <div className="mb-6 p-3 bg-white/10 rounded-lg text-white text-sm border border-white/10">{message}</div>}

            {activeTab === 'notifications' && (
              <>
                <h3 className="text-xl font-bold text-white mb-6">Notification Preferences</h3>
                <div className="flex flex-col gap-6">
                  
                  <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <div>
                      <h4 className="text-red-400 font-medium">Opt-out of all notifications</h4>
                      <p className="text-red-400/70 text-sm">You will not receive any reminders or emails.</p>
                    </div>
                    <Toggle checked={optOut} onChange={setOptOut} colorClass="bg-red-500" />
                  </div>

                  {!optOut && (
                    <>
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <h4 className="text-white font-medium">Use Registered Email</h4>
                          <p className="text-white/50 text-sm">Send notifications to {email}</p>
                        </div>
                        <Toggle checked={useRegisteredEmail} onChange={setUseRegisteredEmail} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">Daily Journal Reminder</h4>
                          <p className="text-white/50 text-sm">Receive a push notification to reflect.</p>
                        </div>
                        <Toggle checked={dailyReminder} onChange={setDailyReminder} />
                      </div>
                      {dailyReminder && (
                        <div>
                          <label className="block text-white/70 text-sm mb-2">Reminder Time</label>
                          <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="w-full sm:w-auto bg-black/20 border border-white/10 rounded-xl py-2 px-4 text-white outline-none cursor-pointer" />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}

            {activeTab === 'privacy' && (
              <>
                <h3 className="text-xl font-bold text-white mb-6">Privacy & Security</h3>
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Allow AI Analysis</h4>
                      <p className="text-white/50 text-sm">Let Gemini analyze entries for Weekly Insights.</p>
                    </div>
                    <Toggle checked={aiAnalysis} onChange={setAiAnalysis} colorClass="bg-[var(--color-accent-purple)]" />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'appearance' && (
              <>
                <h3 className="text-xl font-bold text-white mb-6">Appearance</h3>
                <div className="flex flex-col gap-6">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">App Theme</label>
                    <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white outline-none cursor-pointer">
                      <option value="dark">Midnight Dark (Default)</option>
                      <option value="light">Soft Light (Coming Soon)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <h4 className="text-white font-medium">Reduce Motion</h4>
                      <p className="text-white/50 text-sm">Disable background mesh and floating animations.</p>
                    </div>
                    <Toggle checked={reduceMotion} onChange={setReduceMotion} />
                  </div>
                </div>
              </>
            )}

            <div className="mt-8 pt-6 border-t border-white/10">
              <GlassButton className="w-full sm:w-auto" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Preferences'}
              </GlassButton>
            </div>
          </GlassCard>

          {activeTab === 'privacy' && (
            <GlassCard className="p-8 border-red-500/30">
              <h3 className="text-xl font-bold text-red-400 mb-2">Danger Zone</h3>
              <p className="text-white/60 text-sm mb-6">Permanently delete your account and all journaling data.</p>
              <GlassButton variant="secondary" onClick={handleDeleteAccount} className="!text-red-400 !border-red-500/30 hover:!bg-red-500/20">
                Delete Account
              </GlassButton>
            </GlassCard>
          )}

        </div>
      </div>
    </div>
  );
}
