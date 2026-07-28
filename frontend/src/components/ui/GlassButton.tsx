import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

interface GlassButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

export function GlassButton({ children, variant = 'primary', className = "", ...props }: GlassButtonProps) {
  const baseClasses = "relative px-6 py-3 rounded-full font-medium transition-colors overflow-hidden flex items-center justify-center gap-2";
  
  const variantClasses = {
    primary: "bg-white/20 hover:bg-white/30 border border-white/40 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]",
    secondary: "bg-black/20 hover:bg-black/30 border border-white/10 text-white",
    ghost: "hover:bg-white/10 text-white/80 hover:text-white"
  };

  return (
    <motion.button 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
