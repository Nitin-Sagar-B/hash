import { useState, useCallback, useEffect } from 'react';
import { verifyPin } from '../lib/crypto.js';

const PIN_HASH = "0af7d7158becc6d02dc41536107090e77195cf90c556cadb37866528cc94e8a9";
const PIN_LENGTH = 4;
const NUMPAD_KEYS = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  '',  '0', 'DEL',
];

export default function PinLockScreen({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checking, setChecking] = useState(false);

  const handlePress = useCallback(async (key) => {
    if (checking || success) return;
    if (error) setError(false);

    if (key === 'DEL') {
      setPin(prev => prev.slice(0, -1));
      return;
    }

    if (pin.length >= PIN_LENGTH) return;

    const newPin = pin + key;
    setPin(newPin);

    if (newPin.length === PIN_LENGTH) {
      setChecking(true);
      try {
        const isValid = await verifyPin(newPin, PIN_HASH);
        if (isValid) {
          setSuccess(true);
          setTimeout(() => onUnlock?.(), 600);
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
            setChecking(false);
          }, 700);
        }
      } catch (err) {
        console.error('PIN verification failed:', err);
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
          setChecking(false);
        }, 700);
      }
    }
  }, [pin, checking, success, error, onUnlock]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handlePress(e.key);
      } else if (e.key === 'Backspace') {
        handlePress('DEL');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePress]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0f0f1a 50%, #13131f 100%)' }}>

      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full opacity-20 blur-[100px] pointer-events-none"
        style={{ background: success ? '#10B981' : '#6366F1' }} />

      <div className="flex flex-col items-center px-8 w-full max-w-[340px] animate-fade-in">
        {/* Logo */}
        <div className="mb-2">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #A78BFA)',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)'
            }}>
            <span className="text-2xl font-bold text-white tracking-tight">#</span>
          </div>
        </div>

        <h1 className="text-xl font-semibold text-text-primary mb-1 tracking-tight">Welcome back</h1>
        <p className="text-sm text-text-secondary mb-8">Enter your PIN to continue</p>

        {/* PIN Dots */}
        <div className={`flex gap-4 mb-3 ${error ? 'animate-shake' : ''}`}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`w-[14px] h-[14px] rounded-full border-2 transition-all duration-200 ${
                pin[i]
                  ? error
                    ? 'animate-dot-fill border-accent-error bg-accent-error shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                    : success
                      ? 'animate-dot-fill border-accent-success bg-accent-success shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                      : 'animate-dot-fill border-accent-primary bg-accent-primary shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                  : 'border-[rgba(255,255,255,0.15)] bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Error / Success message */}
        <div className="h-6 flex items-center mb-4">
          {error && <p className="text-xs text-accent-error animate-fade-in">Incorrect PIN</p>}
          {success && <p className="text-xs text-accent-success animate-fade-in">Welcome back, Nit ✨</p>}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3">
          {NUMPAD_KEYS.map((key, index) => {
            if (key === '') {
              return <div key={index} className="w-[76px] h-[76px]" />;
            }

            const isDel = key === 'DEL';

            return (
              <button
                key={index}
                onClick={() => handlePress(key)}
                disabled={checking && !isDel}
                className={`w-[76px] h-[76px] rounded-full flex items-center justify-center
                  text-text-primary transition-all duration-150 select-none
                  active:scale-95 active:bg-[rgba(255,255,255,0.1)]
                  ${isDel
                    ? 'bg-transparent border-none text-text-secondary text-lg hover:text-text-primary'
                    : 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-2xl font-light hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.12)]'
                  }
                  ${checking && !isDel ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {isDel ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                    <line x1="18" y1="9" x2="12" y2="15" />
                    <line x1="12" y1="9" x2="18" y2="15" />
                  </svg>
                ) : key}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
