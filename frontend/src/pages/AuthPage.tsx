import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { Mail, Key, AlertCircle, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Clear errors when switching modes
  useEffect(() => {
    setError(null);
    setMessage(null);
    setPassword('');
  }, [isLogin]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Validation
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        navigate('/dashboard');
      } else {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        setMessage('Success! Please check your email for the confirmation link.');
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      // Handle missing env vars on Vercel causing "Failed to fetch"
      if (err.message === 'Failed to fetch' || err.message.includes('fetch')) {
        setError("Network error: Could not connect to the database. Please ensure your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correctly set in your Vercel Environment Variables.");
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      {/* Dynamic Background Elements for Beauty */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-accent-purple)]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-accent-cyan)]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Logo */}
      <div className="absolute top-0 w-full p-6 flex justify-center items-center z-20">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold tracking-tight text-white flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => navigate('/')}
        >
          <img src="/logo.png" alt="Heralune Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" /> 
          <span className="drop-shadow-md">Heralune</span>
        </motion.div>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? 'login' : 'signup'}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full max-w-md z-10"
        >
          <GlassCard className="p-8 shadow-2xl border-white/10" intensity="heavy">
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-white/60 text-sm">
                {isLogin ? 'Sign in to continue your journey.' : 'Begin your journey with Heralune.'}
              </p>
            </div>

            <AnimatePresence mode="popLayout">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-300 text-sm shadow-inner">
                    <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-red-400" />
                    <p className="leading-relaxed">{error}</p>
                  </div>
                </motion.div>
              )}

              {message && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3 text-emerald-300 text-sm shadow-inner">
                    <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-emerald-400" />
                    <p className="leading-relaxed">{message}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <form onSubmit={handleAuth} className="flex flex-col gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[var(--color-accent-cyan)] transition-colors" size={18} />
                  <input 
                    type="email" 
                    placeholder="you@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-white/30 outline-none focus:border-[var(--color-accent-cyan)] focus:bg-black/30 transition-all shadow-inner"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70 ml-1">Password</label>
                <div className="relative group">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[var(--color-accent-purple)] transition-colors" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white placeholder-white/30 outline-none focus:border-[var(--color-accent-purple)] focus:bg-black/30 transition-all shadow-inner"
                    required
                    minLength={6}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              {isLogin && (
                <div className="flex justify-between items-center text-sm mt-1 mb-2">
                  <label className="flex items-center gap-2 text-white/60 hover:text-white/90 cursor-pointer transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-black/20 accent-[var(--color-accent-cyan)] cursor-pointer" />
                    Remember me
                  </label>
                  <a href="#" className="text-[var(--color-accent-cyan)] hover:text-white transition-colors">Forgot password?</a>
                </div>
              )}

              <GlassButton 
                type="submit" 
                className="w-full justify-center mt-2 py-3.5 text-base font-semibold group relative overflow-hidden" 
                disabled={loading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent-purple)] to-[var(--color-accent-cyan)] opacity-0 group-hover:opacity-20 transition-opacity" />
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </span>
                ) : (
                  isLogin ? 'Sign In' : 'Sign Up'
                )}
              </GlassButton>
            </form>
            
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-white/50 text-sm">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => setIsLogin(!isLogin)} 
                  className="text-white font-medium hover:text-[var(--color-accent-cyan)] transition-colors hover:underline underline-offset-4 ml-1"
                >
                  {isLogin ? 'Create one now' : 'Sign in instead'}
                </button>
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
