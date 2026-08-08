import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { Mail, Key, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Check your email for the confirmation link.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6">
      <div className="absolute top-0 w-full p-6 flex justify-center items-center">
        <div className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="Heralune Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" /> Heralune
        </div>
      </div>
      
      <GlassCard className="w-full max-w-md p-8" intensity="heavy">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-white/70 text-center mb-8">
          {isLogin ? 'Sign in to continue your journey.' : 'Begin your journey with Heralune.'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-2 text-red-200 text-sm">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm text-center">
            {message}
          </div>
        )}
        
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/50 outline-none focus:border-[var(--color-accent-cyan)] transition-colors"
              required
            />
          </div>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/50 outline-none focus:border-[var(--color-accent-cyan)] transition-colors"
              required
            />
          </div>
          
          {isLogin && (
            <div className="flex justify-between items-center text-sm mt-2 mb-4">
              <label className="flex items-center gap-2 text-white/70 cursor-pointer">
                <input type="checkbox" className="accent-[var(--color-accent-purple)]" />
                Remember me
              </label>
              <a href="#" className="text-[var(--color-accent-cyan)] hover:underline">Forgot password?</a>
            </div>
          )}

          <GlassButton type="submit" className="w-full justify-center mt-2" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </GlassButton>
        </form>
        
        <p className="text-center text-white/50 text-sm mt-8">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-white hover:underline">
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </GlassCard>
    </div>
  );
}
