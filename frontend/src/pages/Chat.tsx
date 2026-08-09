import React, { useEffect, useRef, useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, Send, Square, History, MoreVertical, Trash2, Settings, Download, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabase';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

type Message = { id: string; role: 'user' | 'model'; content: string };
type ChatHistoryItem = { id: string; title: string; date: string; preview: string };

export default function Chat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // UI States
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Mock History Data
  const [chatHistory] = useState<ChatHistoryItem[]>([
    { id: '1', title: 'Morning Reflection', date: 'Today, 8:00 AM', preview: 'I woke up feeling pretty good today...' },
    { id: '2', title: 'Work Stress', date: 'Yesterday', preview: 'The upcoming deadline is really getting to me...' },
    { id: '3', title: 'Weekend Plans', date: 'Oct 12', preview: 'Thinking about going to the park if the weather is nice.' }
  ]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate('/auth');
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 120) + 'px';
    }
  }, [input]);

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

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the current chat?')) {
      setMessages([]);
      setIsMoreMenuOpen(false);
    }
  };

  return (
    <div className="h-screen w-full relative flex flex-col items-center overflow-hidden bg-[var(--color-bg-dark)]">
      {/* Background Decorative Blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-accent-purple)]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-accent-cyan)]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content Area */}
      <div className={`w-full h-full p-4 md:p-6 flex flex-col relative z-10 transition-all duration-300 ${isHistoryOpen ? 'md:pr-[340px]' : ''}`}>
        
        {/* Header */}
        <div className="w-full max-w-5xl mx-auto flex flex-shrink-0 items-center justify-between p-4 border border-white/10 bg-black/30 backdrop-blur-xl rounded-2xl mb-4 shadow-lg relative z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="p-2 -ml-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div 
              className="text-xl font-bold text-white flex items-center gap-3 cursor-pointer group" 
              onClick={() => navigate('/dashboard')}
            >
              <img src="/logo.png" alt="Heralune Logo" className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] group-hover:scale-105 transition-transform" />
              <span className="tracking-wide">Heralune</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 relative">
            <GlassButton 
              variant="ghost" 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className={`!p-2.5 transition-colors ${isHistoryOpen ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
            >
              <History size={20} />
            </GlassButton>
            
            <div className="relative">
              <GlassButton 
                variant="ghost" 
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className={`!p-2.5 transition-colors ${isMoreMenuOpen ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
              >
                <MoreVertical size={20} />
              </GlassButton>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isMoreMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-[#1e2330] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 py-1"
                  >
                    <button 
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="w-full text-left px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
                    >
                      <Settings size={16} /> Settings
                    </button>
                    <button 
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="w-full text-left px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors"
                    >
                      <Download size={16} /> Export Journal
                    </button>
                    <div className="h-px bg-white/10 my-1"></div>
                    <button 
                      onClick={handleClearChat}
                      className="w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                    >
                      <Trash2 size={16} /> Clear Chat
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Click-away overlay for dropdown */}
        {isMoreMenuOpen && (
          <div className="fixed inset-0 z-10" onClick={() => setIsMoreMenuOpen(false)} />
        )}

        {/* Main Chat Area */}
        <div className="flex-grow min-h-0 w-full max-w-5xl mx-auto flex flex-col mb-4 relative">
          <GlassCard className="flex-grow flex flex-col overflow-hidden shadow-2xl border-white/10 bg-black/20" intensity="heavy">
            <div className="flex-grow overflow-y-auto p-4 md:p-8 flex flex-col gap-6 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-70 select-none pointer-events-none">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="mb-6 relative"
                  >
                    <div className="absolute inset-0 bg-[var(--color-accent-cyan)]/20 blur-xl rounded-full" />
                    <img src="/logo.png" alt="Heralune Logo" className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] relative z-10" />
                  </motion.div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">A Safe Space for Your Thoughts</h2>
                  <p className="text-white/60 max-w-md text-center text-sm md:text-base leading-relaxed">
                    Type or speak what's on your mind. Heralune is here to listen without judgment and help you reflect.
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((m) => (
                    <motion.div 
                      key={m.id} 
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] md:max-w-[75%] px-5 py-4 shadow-lg ${
                        m.role === 'user' 
                          ? 'bg-gradient-to-br from-[var(--color-accent-purple)] to-[var(--color-accent-purple)]/60 text-white rounded-2xl rounded-tr-sm' 
                          : 'bg-white/10 backdrop-blur-md text-white border border-white/10 rounded-2xl rounded-tl-sm'
                      }`}>
                        {m.role === 'user' ? (
                          <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{m.content}</p>
                        ) : (
                          <div className="prose prose-invert max-w-none text-[15px] prose-p:leading-relaxed prose-headings:text-white">
                            <ReactMarkdown>{m.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </GlassCard>
        </div>

        {/* Input Area */}
        <div className="w-full max-w-5xl mx-auto flex-shrink-0">
          <GlassCard className="p-3 flex items-end gap-3 bg-black/40 border-white/20 shadow-2xl backdrop-blur-xl" intensity="medium">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Journal your thoughts... (Shift+Enter for new line)"
              className="flex-grow bg-transparent border-none text-white resize-none max-h-32 p-3 outline-none placeholder-white/30 text-[15px] leading-relaxed custom-scrollbar"
              rows={1}
            />
            <div className="flex gap-2 p-1 pb-2 shrink-0">
              <button 
                type="button" 
                onClick={toggleListening} 
                className={`p-3 rounded-full transition-all flex items-center justify-center ${
                  isListening 
                    ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                    : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
                title="Voice Dictation"
              >
                <Mic size={20} />
              </button>
              
              {isLoading ? (
                <button 
                  type="button" 
                  onClick={stop} 
                  className="p-3 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors flex items-center justify-center border border-red-500/30"
                  title="Stop Generating"
                >
                  <Square size={20} fill="currentColor" />
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={(e) => handleFormSubmit(e)} 
                  disabled={!input.trim()}
                  className={`p-3 rounded-full transition-all flex items-center justify-center ${
                    input.trim() 
                      ? 'bg-[var(--color-accent-purple)] hover:opacity-90 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' 
                      : 'bg-white/10 text-white/30 cursor-not-allowed'
                  }`}
                  title="Send (Enter)"
                >
                  <Send size={20} className={input.trim() ? 'translate-x-0.5' : ''} />
                </button>
              )}
            </div>
          </GlassCard>
        </div>

      </div>

      {/* History Sidebar Panel */}
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
            />
            
            <motion.div 
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-[320px] h-full bg-[#0a0d14]/90 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-40 flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <History size={18} className="text-[var(--color-accent-cyan)]" />
                  Past Entries
                </h3>
                <button 
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4 border-b border-white/5 bg-black/10">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input 
                    type="text" 
                    placeholder="Search journal..." 
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-[var(--color-accent-cyan)] transition-colors"
                  />
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
                {chatHistory.map(item => (
                  <button key={item.id} className="text-left p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all group">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-white/90 group-hover:text-white truncate pr-2">{item.title}</h4>
                      <span className="text-[10px] text-white/40 whitespace-nowrap pt-1">{item.date}</span>
                    </div>
                    <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                      {item.preview}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
