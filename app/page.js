"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Mic, Send, Square } from "lucide-react";
import Image from "next/image";
import styles from "./page.module.css";

const springTransition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

const TypingIndicator = () => (
  <div className={styles.typingIndicator}>
    <span className={styles.typingDot}></span>
    <span className={styles.typingDot}></span>
    <span className={styles.typingDot}></span>
  </div>
);

export default function Home() {
  const { messages, input, setInput, handleInputChange, append, setMessages, isLoading, stop } = useChat({
    api: "/api/chat",
  });
  
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Load local history on mount
  useEffect(() => {
    const saved = localStorage.getItem("heralune02_history");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load chat history");
      }
    }
  }, [setMessages]);

  // Save history on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("heralune02_history", JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Voice Input Setup
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let currentTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      
      const fakeEvent = {
        target: { value: currentTranscript }
      };
      handleInputChange(fakeEvent);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'network') {
        alert("Speech recognition failed due to a network error. This often happens in Chromium browsers without Google API keys or when not using HTTPS.");
      } else {
        alert("Speech recognition error: " + event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    if (!input || typeof input !== 'string' || !input.trim()) return;

    if (typeof append === 'function') {
      append({ role: 'user', content: input });
      if (typeof setInput === 'function') setInput("");
    } else {
      console.error("append is not a function. Check @ai-sdk/react hook.", { append });
      alert("Error: Chat functionality unavailable.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e);
    }
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Image src="/logo.png" alt="Heralune Logo" width={32} height={32} className={styles.headerLogo} />
        <h1 className={styles.headerTitle}>Heralune</h1>
      </header>
      <div className={styles.chatContainer}>
        {messages.length === 0 ? (
          <motion.div 
            className={styles.emptyState}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springTransition}
          >
            <Image src="/logo.png" alt="Heralune Logo" width={120} height={120} priority className={styles.logoLarge} />
            <h1 className={styles.emptyTitle}>Heralune</h1>
            <p>How are you feeling today?</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {messages.filter(m => m.content.trim() !== '').map((m) => (
              <motion.div 
                key={m.id} 
                className={`${styles.messageRow} ${m.role === 'user' ? styles.userRow : styles.aiRow}`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className={`${styles.bubble} ${m.role === 'user' ? styles.userBubble : styles.aiBubble}`}>
                  {m.role === 'user' ? (
                    <p style={{ whiteSpace: 'pre-wrap' }}>{m.content}</p>
                  ) : (
                    <div className={styles.markdownContainer}>
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {isLoading && (messages.length === 0 || messages[messages.length - 1]?.role === 'user' || messages[messages.length - 1]?.content === '') && (
              <motion.div
                key="typing-indicator"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`${styles.messageRow} ${styles.aiRow}`}
              >
                <TypingIndicator />
              </motion.div>
            )}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      <motion.form 
        onSubmit={handleFormSubmit}
        className={styles.inputWrapper}
        initial={{ x: "-50%", y: 100, opacity: 0 }}
        animate={{ x: "-50%", y: 0, opacity: 1 }}
        transition={{ ...springTransition, delay: 0.2 }}
      >
        <textarea
          ref={inputRef}
          className={styles.inputField}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Journal your thoughts..."
          rows={1}
        />
        
        <motion.button 
          type="button" 
          onClick={toggleListening}
          className={`${styles.actionButton} ${isListening ? styles.listening : ''}`}
          whileTap={{ scale: 0.9 }}
          title="Voice Input"
        >
          <Mic size={20} />
        </motion.button>

        {isLoading ? (
          <motion.button 
            type="button" 
            onClick={stop}
            className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
            whileTap={{ scale: 0.9 }}
            title="Stop generating"
          >
            <Square size={20} fill="#111" />
          </motion.button>
        ) : (
          <motion.button 
            type="button" 
            onClick={(e) => {
              e.preventDefault();
              handleFormSubmit(e);
            }}
            className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
            whileTap={{ scale: 0.9 }}
            title="Send"
          >
            <Send size={20} />
          </motion.button>
        )}
      </motion.form>
    </div>
  );
}
