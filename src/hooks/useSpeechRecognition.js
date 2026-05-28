import { useState, useCallback, useRef, useEffect } from 'react';
import { createSpeechRecognition } from '../lib/speech.js';

/**
 * React hook for speech recognition
 * @returns {object} - { transcript, interimText, isListening, startListening, stopListening, isSupported }
 */
export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startListening = useCallback(() => {
    // Clean up previous instance
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const sr = createSpeechRecognition({
      continuous: true,
      interimResults: true,
      onResult: (text) => {
        setTranscript(text);
        setInterimText('');
      },
      onInterim: (text) => {
        setInterimText(text);
      },
      onError: (error) => {
        console.error('Speech error:', error);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    if (sr.isSupported) {
      recognitionRef.current = sr;
      sr.start();
      setIsListening(true);
      setTranscript('');
      setInterimText('');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    transcript,
    interimText,
    isListening,
    startListening,
    stopListening,
    isSupported
  };
}
