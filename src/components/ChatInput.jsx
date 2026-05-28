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
    <div className="solid-nav px-4 pt-3 pb-safe-bottom">
      <div className="flex items-end gap-3 max-w-lg mx-auto w-full">
        
        {isSupported && (
          <button
            onClick={isListening ? stopListening : startListening}
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all
              ${isListening 
                ? 'bg-accent-error/20 text-accent-error animate-pulse-subtle' 
                : 'bg-bg-elevated text-text-secondary hover:text-text-primary'}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isListening ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
        )}

        <div className="flex-1 bg-bg-input border border-[rgba(255,255,255,0.04)] rounded-[20px] px-4 py-3 mb-1 flex items-end shadow-inner focus-within:border-accent-primary/50">
          <textarea
            ref={textareaRef}
            value={displayValue}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening...' : 'Message Hash...'}
            rows={1}
            disabled={disabled}
            className="w-full bg-transparent text-[15px] font-medium text-text-primary placeholder-text-tertiary outline-none resize-none max-h-[120px]"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mb-1 transition-all
            ${input.trim() && !disabled
              ? 'bg-accent-primary text-white hover:opacity-90 shadow-md'
              : 'bg-bg-elevated text-text-tertiary opacity-50 cursor-not-allowed'
            }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5 mt-0.5">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
