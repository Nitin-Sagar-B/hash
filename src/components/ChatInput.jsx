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
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
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
    <div className="glass-nav px-4 pt-3 pb-safe-bottom">
      <div className="flex items-end gap-2 max-w-lg mx-auto">
        {/* Voice button */}
        {isSupported && (
          <button
            onClick={toggleVoice}
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
              ${isListening
                ? 'bg-accent-error/20 text-accent-error animate-mic-pulse'
                : 'bg-[rgba(255,255,255,0.06)] text-text-secondary hover:text-text-primary hover:bg-[rgba(255,255,255,0.1)]'
              }`}
            title={isListening ? 'Stop recording' : 'Start voice input'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isListening ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
        )}

        {/* Text input */}
        <div className="flex-1 bg-bg-input border border-glass-border rounded-2xl px-4 py-2.5 flex items-end">
          <textarea
            ref={textareaRef}
            value={displayValue}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening...' : 'Message Hash...'}
            rows={1}
            disabled={disabled}
            className="w-full bg-transparent text-sm text-text-primary placeholder-text-tertiary outline-none resize-none leading-relaxed max-h-[120px]"
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
            ${input.trim() && !disabled
              ? 'bg-accent-primary text-white hover:bg-accent-primary/80 shadow-[0_4px_12px_rgba(99,102,241,0.3)]'
              : 'bg-[rgba(255,255,255,0.04)] text-text-tertiary cursor-not-allowed'
            }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      {/* Voice status */}
      {isListening && (
        <div className="flex items-center justify-center gap-2 py-2 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-accent-error animate-pulse" />
          <span className="text-xs text-accent-error">Listening...</span>
        </div>
      )}
    </div>
  );
}
