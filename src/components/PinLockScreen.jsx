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
          setTimeout(() => onUnlock?.(), 500);
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
            setChecking(false);
          }, 600);
        }
      } catch (err) {
        console.error('PIN verification failed:', err);
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
          setChecking(false);
        }, 600);
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg-primary">

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full opacity-[0.15] blur-[100px] pointer-events-none transition-colors duration-500"
        style={{ background: success ? 'var(--color-accent-success)' : 'var(--color-accent-primary)' }} />

      <div className="flex flex-col items-center px-8 w-full max-w-[360px] animate-fade-in z-10">
        {/* Logo */}
        <div className="mb-4">
          <div className="w-[72px] h-[72px] rounded-[24px] flex items-center justify-center mx-auto shadow-2xl shadow-accent-primary/20"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent-primary), #6366F1)'
            }}>
            <span className="text-[32px] font-extrabold text-white tracking-tight">#</span>
          </div>
        </div>

        <h1 className="text-[22px] font-bold text-text-primary mb-1 tracking-tight">Welcome back</h1>
        <p className="text-[15px] font-medium text-text-secondary mb-10">Enter your PIN to continue</p>

        {/* PIN Dots */}
        <div className={`flex gap-5 mb-5 ${error ? 'animate-shake' : ''}`}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`w-[16px] h-[16px] rounded-full transition-all duration-300 ${
                pin[i]
                  ? error
                    ? 'animate-dot-fill bg-accent-error shadow-[0_0_16px_rgba(239,68,68,0.6)] scale-110'
                    : success
                      ? 'animate-dot-fill bg-accent-success shadow-[0_0_16px_rgba(16,185,129,0.6)] scale-110'
                      : 'animate-dot-fill bg-accent-primary shadow-[0_0_16px_rgba(67,56,202,0.6)] scale-110'
                  : 'bg-[rgba(255,255,255,0.08)] scale-100'
              }`}
            />
          ))}
        </div>

        {/* Error / Success message */}
        <div className="h-6 flex items-center mb-8">
          {error && <p className="text-[13px] font-bold text-accent-error animate-fade-in uppercase tracking-widest">Incorrect PIN</p>}
          {success && <p className="text-[13px] font-bold text-accent-success animate-fade-in uppercase tracking-widest">Welcome back ✨</p>}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          {NUMPAD_KEYS.map((key, index) => {
            if (key === '') {
              return <div key={index} className="w-[78px] h-[78px]" />;
            }

            const isDel = key === 'DEL';

            return (
              <button
                key={index}
                onClick={() => handlePress(key)}
                disabled={checking && !isDel}
                className={`w-[78px] h-[78px] rounded-full flex items-center justify-center
                  transition-all duration-200 select-none
                  active:scale-90
                  ${isDel
                    ? 'bg-transparent text-text-secondary hover:text-text-primary'
                    : 'bg-[rgba(255,255,255,0.04)] text-text-primary text-[28px] font-medium hover:bg-[rgba(255,255,255,0.08)] active:bg-[rgba(255,255,255,0.12)]'
                  }
                  ${checking && !isDel ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {isDel ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
