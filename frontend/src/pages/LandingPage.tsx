import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { Sparkles, BrainCircuit, HeartHandshake, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6">
      
      {/* Navbar placeholder */}
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Sparkles className="text-[var(--color-accent-cyan)]" />
          Heralune
        </div>
        <GlassButton variant="ghost" onClick={() => navigate('/auth')}>Sign In</GlassButton>
      </nav>

      {/* Hero Section */}
      <motion.div 
        className="max-w-4xl w-full text-center mt-20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1 
          className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight leading-tight mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Understand your emotions with AI that listens.
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          A premium, emotionally intelligent companion designed to help you reflect, grow, and build healthier habits in a calm space.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <GlassButton onClick={() => navigate('/auth')} className="text-lg px-8 py-4">
            Start Journaling Free
          </GlassButton>
          <GlassButton variant="secondary" className="text-lg px-8 py-4">
            See How It Works
          </GlassButton>
        </motion.div>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mt-32 z-10 relative pb-20">
        <GlassCard className="p-8 text-center flex flex-col items-center">
          <div className="p-4 bg-white/10 rounded-full mb-6">
            <BrainCircuit size={32} className="text-[var(--color-accent-purple)]" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Deep Insights</h3>
          <p className="text-white/70">Discover hidden patterns in your mood over time with advanced AI analytics.</p>
        </GlassCard>
        
        <GlassCard className="p-8 text-center flex flex-col items-center">
          <div className="p-4 bg-white/10 rounded-full mb-6">
            <HeartHandshake size={32} className="text-pink-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Empathetic Responses</h3>
          <p className="text-white/70">Journal naturally while Heralune listens and responds with thoughtful encouragement.</p>
        </GlassCard>

        <GlassCard className="p-8 text-center flex flex-col items-center">
          <div className="p-4 bg-white/10 rounded-full mb-6">
            <ShieldCheck size={32} className="text-[var(--color-accent-cyan)]" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Private & Secure</h3>
          <p className="text-white/70">Your reflections belong strictly to you. Authenticated and securely stored.</p>
        </GlassCard>
      </div>
      
    </div>
  );
}
