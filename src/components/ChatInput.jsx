import { useState, useRef, useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';

export default function ChatInput({ onSend, disabled = false }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);
  const { transcript, interimText, isListening, startListening, stopListening, isSupported } = useSpeechRecognition();

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  }, [input]);

  useEffect(() => {
    if (transcript) {
      setInput(prev => prev ? prev + ' ' + transcript : transcript);
    }
  }, [transcript]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || disabled) return;
    onSend(text);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const displayValue = isListening && interimText ? (input ? input + ' ' + interimText : interimText) : input;

  return (
    <div className="bg-bg-primary pb-safe-bottom w-full centered-layout pb-4 pt-2">
      <div className="centered-container flex items-end gap-2">
        
        {isSupported && (
          <button
            onClick={isListening ? stopListening : startListening}
            className={`flex-shrink-0 w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all
              ${isListening 
                ? 'bg-accent-error/20 text-accent-error animate-pulse-subtle' 
                : 'bg-bg-surface text-text-secondary hover:text-text-primary border border-[rgba(255,255,255,0.08)]'}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isListening ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
        )}

        <div className="flex-1 bg-bg-surface border border-[rgba(255,255,255,0.08)] rounded-[24px] px-5 py-3.5 flex items-end shadow-lg focus-within:border-accent-primary/60 transition-colors">
          <textarea
            ref={textareaRef}
            value={displayValue}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening...' : 'Message Hash...'}
            rows={1}
            disabled={disabled}
            className="w-full bg-transparent text-[16px] font-medium text-text-primary placeholder-text-tertiary outline-none resize-none max-h-[120px]"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className={`flex-shrink-0 w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all
            ${input.trim() && !disabled
              ? 'bg-accent-primary text-white hover:scale-105 shadow-[0_4px_16px_rgba(239,51,64,0.4)]'
              : 'bg-bg-surface text-text-tertiary opacity-50 cursor-not-allowed border border-[rgba(255,255,255,0.08)]'
            }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5 mt-0.5">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
