import React from 'react';
import { X, Send, Bot } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface InsightsChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InsightsChatModal: React.FC<InsightsChatModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <GlassCard className="relative w-full max-w-lg h-[600px] flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden" intensity="heavy">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-accent-cyan)]/20 flex items-center justify-center text-[var(--color-accent-cyan)]">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Insight Guide</h2>
              <p className="text-white/50 text-xs">Discussing your sleep & journaling habits</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-grow p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar">
          
          {/* AI Message */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[var(--color-accent-cyan)]/20 flex-shrink-0 flex items-center justify-center text-[var(--color-accent-cyan)]">
              <Bot size={16} />
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm p-4 max-w-[85%] text-white/80 text-sm leading-relaxed">
              Hi there! I noticed you have been journaling frequently in the mornings, but your sleep quality improves when you journal after 8 PM. How are you feeling about adjusting your routine?
            </div>
          </div>

          {/* User Message (Mock) */}
          <div className="flex gap-4 flex-row-reverse">
            <div className="bg-[var(--color-accent-purple)]/20 border border-[var(--color-accent-purple)]/30 rounded-2xl rounded-tr-sm p-4 max-w-[85%] text-white/90 text-sm leading-relaxed">
              I usually feel too tired to write at night. Any tips to make it easier?
            </div>
          </div>
          
          {/* AI Message */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[var(--color-accent-cyan)]/20 flex-shrink-0 flex items-center justify-center text-[var(--color-accent-cyan)]">
              <Bot size={16} />
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm p-4 max-w-[85%] text-white/80 text-sm leading-relaxed">
              That's completely understandable. You don't need to write a lot! Even just a quick bullet point of one good thing that happened today can help your brain decompress before sleep.
            </div>
          </div>

        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-2">
            <input 
              type="text"
              placeholder="Ask about your insights..."
              className="flex-grow bg-white/5 border border-white/10 rounded-full py-3 px-5 text-white placeholder-white/40 outline-none focus:border-[var(--color-accent-cyan)] transition-colors text-sm"
              onClick={() => console.log('Chat input clicked')}
            />
            <button 
              className="p-3 bg-[var(--color-accent-cyan)]/20 text-[var(--color-accent-cyan)] hover:bg-[var(--color-accent-cyan)] hover:text-black rounded-full transition-colors flex-shrink-0"
              onClick={() => console.log('Send message clicked')}
            >
              <Send size={18} />
            </button>
          </div>
        </div>

      </GlassCard>
    </div>
  );
};
