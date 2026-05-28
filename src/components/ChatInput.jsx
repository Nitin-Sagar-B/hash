import { useState, useRef, useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';

export default function ChatInput({ onSend, disabled = false }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);
  const { transcript, interimText, isListening, startListening, stopListening, isSupported } = useSpeechRecognition();

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
    }
  }, [input]);

  // Handle voice transcript
  useEffect(() => {
    if (transcript) {
      setInput(prev => {
        const newText = prev ? prev + ' ' + transcript : transcript;
        return newText;
      });
    }
  }, [transcript]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || disabled) return;
    onSend(text);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const displayValue = isListening && interimText ? (input ? input + ' ' + interimText : interimText) : input;

  return (
    <div className="glass-nav px-6 pt-4 pb-safe-bottom">
      <div className="flex items-end gap-3 max-w-lg mx-auto">
        {/* Voice button */}
        {isSupported && (
          <button
            onClick={toggleVoice}
            className={`flex-shrink-0 w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all duration-300
              ${isListening
                ? 'bg-accent-error/10 text-accent-error animate-pulse-subtle shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                : 'bg-[rgba(255,255,255,0.05)] text-text-secondary hover:text-text-primary hover:bg-[rgba(255,255,255,0.1)] active:scale-95'
              }`}
            title={isListening ? 'Stop recording' : 'Start voice input'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={isListening ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
        )}

        {/* Text input */}
        <div className="flex-1 bg-bg-input border border-glass-border rounded-3xl px-5 py-3 flex items-end transition-all focus-within:border-accent-primary/50 focus-within:bg-[rgba(255,255,255,0.03)] shadow-inner">
          <textarea
            ref={textareaRef}
            value={displayValue}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening...' : 'Message Hash...'}
            rows={1}
            disabled={disabled}
            className="w-full bg-transparent text-[15px] font-medium text-text-primary placeholder-text-tertiary outline-none resize-none leading-relaxed max-h-[140px]"
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className={`flex-shrink-0 w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all duration-300
            ${input.trim() && !disabled
              ? 'bg-accent-primary text-white hover:opacity-90 active:scale-95 shadow-lg shadow-accent-primary/30'
              : 'bg-[rgba(255,255,255,0.03)] text-text-tertiary cursor-not-allowed opacity-50'
            }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      {/* Voice status */}
      <div className={`flex items-center justify-center gap-2 py-2 mt-1 transition-opacity duration-300 ${isListening ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
        <div className="w-1.5 h-1.5 rounded-full bg-accent-error animate-pulse-subtle" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-accent-error">Listening...</span>
      </div>
    </div>
  );
}
