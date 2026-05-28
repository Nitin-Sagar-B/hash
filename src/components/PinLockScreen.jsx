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
      <div className="flex flex-col items-center px-6 w-full max-w-[360px] animate-fade-in z-10">
        
        <div className="mb-6">
          <div className="w-[80px] h-[80px] rounded-[24px] flex items-center justify-center mx-auto shadow-[0_8px_32px_rgba(79,70,229,0.25)] bg-accent-primary">
            <span className="text-[36px] font-extrabold text-white tracking-tight">#</span>
          </div>
        </div>

        <h1 className="text-[24px] font-bold text-text-primary mb-1 tracking-tight">Welcome back</h1>
        <p className="text-[14px] font-medium text-text-secondary mb-12">Enter your PIN to continue</p>

        <div className={`flex gap-6 mb-8 ${error ? 'animate-shake' : ''}`}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`w-[18px] h-[18px] rounded-full transition-all duration-300 ${
                pin[i]
                  ? error
                    ? 'animate-dot-fill bg-accent-error shadow-[0_0_20px_rgba(244,63,94,0.6)] scale-110'
                    : success
                      ? 'animate-dot-fill bg-accent-success shadow-[0_0_20px_rgba(16,185,129,0.6)] scale-110'
                      : 'animate-dot-fill bg-accent-primary shadow-[0_0_20px_rgba(79,70,229,0.6)] scale-110'
                  : 'bg-[rgba(255,255,255,0.06)] scale-100'
              }`}
            />
          ))}
        </div>

        <div className="h-6 flex items-center mb-10">
          {error && <p className="text-[12px] font-bold text-accent-error animate-fade-in uppercase tracking-widest">Incorrect PIN</p>}
          {success && <p className="text-[12px] font-bold text-accent-success animate-fade-in uppercase tracking-widest">Welcome back ✨</p>}
        </div>

        <div className="grid grid-cols-3 gap-x-6 gap-y-4">
          {NUMPAD_KEYS.map((key, index) => {
            if (key === '') {
              return <div key={index} className="w-[80px] h-[80px]" />;
            }

            const isDel = key === 'DEL';

            return (
              <button
                key={index}
                onClick={() => handlePress(key)}
                disabled={checking && !isDel}
                className={`w-[80px] h-[80px] rounded-full flex items-center justify-center
                  transition-all duration-200 select-none
                  active:scale-90
                  ${isDel
                    ? 'bg-transparent text-text-secondary hover:text-text-primary'
                    : 'bg-bg-elevated text-text-primary text-[32px] font-medium hover:bg-[rgba(255,255,255,0.08)] active:bg-[rgba(255,255,255,0.12)]'
                  }
                  ${checking && !isDel ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {isDel ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
