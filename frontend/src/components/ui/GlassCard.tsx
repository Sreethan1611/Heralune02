import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
}

export function GlassCard({ children, className = "", intensity = 'medium', ...props }: GlassCardProps) {
  const blurClasses = {
    light: 'backdrop-blur-md bg-white/5 border-white/10',
    medium: 'backdrop-blur-xl bg-white/10 border-white/20',
    heavy: 'backdrop-blur-2xl bg-white/15 border-white/30',
  };

  return (
    <motion.div 
      className={`rounded-2xl border shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] overflow-hidden ${blurClasses[intensity]} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
