import { useEffect, useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AvatarCarousel } from '../components/ui/AvatarCarousel';

export default function Profile() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatarSeed, setAvatarSeed] = useState('heralune');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      } else {
        setEmail(session.user.email || '');
        const meta = session.user.user_metadata;
        setNickname(meta?.nickname || '');
        setAvatarSeed(meta?.avatarSeed || session.user.id || 'heralune');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentMeta = user?.user_metadata || {};
      
      const { error } = await supabase.auth.updateUser({
        data: { ...currentMeta, nickname, avatarSeed }
      });
      if (error) throw error;
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage('Error updating profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 relative z-10 flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full max-w-2xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <GlassButton variant="ghost" onClick={() => navigate('/dashboard')} className="!p-2 text-white/60 hover:text-white">
            <ArrowLeft size={20} />
          </GlassButton>
          <div className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <User className="text-[var(--color-accent-cyan)]" size={24} />
            Your Profile
          </div>
        </div>
      </header>

      <div className="w-full max-w-2xl flex flex-col gap-6">
        <GlassCard className="p-8" intensity="heavy">
          
          {message && <div className="mb-6 p-3 bg-white/10 rounded-lg text-white text-sm border border-white/10">{message}</div>}

          <div className="flex flex-col gap-8">
            
            {/* Custom Avatar Carousel */}
            <AvatarCarousel 
              currentSeed={avatarSeed} 
              onSelectSeed={setAvatarSeed} 
            />

            <div>
              <label className="block text-white/70 text-sm mb-2">Email Address</label>
              <input type="email" value={email} disabled className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white/50 outline-none cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">Preferred Name / Nickname</label>
              <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="How should Heralune call you?" className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-[var(--color-accent-cyan)] transition-colors" />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <GlassButton className="w-full sm:w-auto" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
