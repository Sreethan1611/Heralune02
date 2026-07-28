import React, { useEffect, useRef, useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, Mic, Send, Square, History, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabase';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

type Message = { id: string; role: 'user' | 'model'; content: string };

export default function Chat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Auth check
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/auth');
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      let currentTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setInput(currentTranscript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input || !input.trim()) return;
    
    const userMessage = input;
    setInput('');
    const newMessages = [...messages, { id: Date.now().toString(), role: 'user', content: userMessage } as Message];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: newMessages.map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
          })),
          systemInstruction: {
            role: "user",
            parts: [{ text: "You are Heralune, a supportive emotional assistant and journal companion. Respond with deep empathy, encouragement, and gentle reflection." }]
          }
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMessageContent = "";
      const aiMessageId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, { id: aiMessageId, role: 'model', content: "" }]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            const dataStr = line.replace(/^data:\s*/, '').trim();
            if (dataStr === '[DONE]') continue;
            try {
              const data = JSON.parse(dataStr);
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
              if (text) {
                aiMessageContent += text;
                setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: aiMessageContent } : m));
              }
            } catch (e) {
              console.error("Failed to parse JSON from chunk", dataStr);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
         console.error("Gemini API Error:", error);
         setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: "I'm having trouble connecting to my thoughts right now. Please try again later." }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit();
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 relative z-10 flex flex-col items-center">
      
      {/* Header */}
      <header className="w-full max-w-5xl flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <GlassButton variant="ghost" onClick={() => navigate('/dashboard')} className="!p-2 text-white/60 hover:text-white">
            <ArrowLeft size={20} />
          </GlassButton>
          <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="text-[var(--color-accent-cyan)]" size={20} />
            Heralune Session
          </div>
        </div>
        <div className="flex items-center gap-2">
          <GlassButton variant="ghost" className="!p-2 text-white/60 hover:text-white">
            <History size={20} />
          </GlassButton>
          <GlassButton variant="ghost" className="!p-2 text-white/60 hover:text-white">
            <MoreVertical size={20} />
          </GlassButton>
        </div>
      </header>

      {/* Main Chat Area */}
      <GlassCard className="w-full max-w-5xl flex-grow flex flex-col mb-4 overflow-hidden" intensity="heavy">
        <div className="flex-grow overflow-y-auto p-6 md:p-8 flex flex-col gap-6">
          {messages.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center opacity-70">
              <Sparkles size={48} className="text-[var(--color-accent-cyan)] mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">How are you feeling?</h2>
              <p className="text-white/80 max-w-md">Type or speak your thoughts. Heralune is here to listen and help you reflect.</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((m) => (
                <motion.div 
                  key={m.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-5 py-4 ${m.role === 'user' ? 'bg-[var(--color-primary-midnight)]/80 text-white border border-white/10' : 'bg-white/10 text-white/90 border border-[var(--color-accent-purple)]/30'}`}>
                    {m.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    ) : (
                      <div className="prose prose-invert max-w-none">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>
      </GlassCard>

      {/* Input Area */}
      <div className="w-full max-w-5xl">
        <GlassCard className="p-2 flex items-end gap-2" intensity="medium">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Journal your thoughts..."
            className="flex-grow bg-transparent border-none text-white resize-none max-h-32 p-3 outline-none placeholder-white/40"
            rows={1}
          />
          <div className="flex gap-2 p-2">
            <GlassButton type="button" variant="ghost" onClick={toggleListening} className={`!p-3 ${isListening ? 'text-red-400 animate-pulse' : 'text-white/60 hover:text-[var(--color-accent-cyan)]'}`}>
              <Mic size={20} />
            </GlassButton>
            {isLoading ? (
              <GlassButton type="button" onClick={stop} className="!p-3 bg-red-500/20 hover:bg-red-500/40 text-red-200 border-red-500/30">
                <Square size={20} fill="currentColor" />
              </GlassButton>
            ) : (
              <button type="button" onClick={(e) => handleFormSubmit(e)} className="!p-3 bg-[var(--color-accent-purple)] hover:bg-[var(--color-accent-purple)]/80 border-none cursor-pointer rounded-full relative px-6 py-3 flex items-center justify-center gap-2 text-white">
                <Send size={20} />
              </button>
            )}
          </div>
        </GlassCard>
      </div>

    </div>
  );
}
