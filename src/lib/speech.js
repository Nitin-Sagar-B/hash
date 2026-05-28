/**
 * Create a SpeechRecognition instance with configuration
 * @returns {object} - { start, stop, isSupported, recognition }
 */
export function createSpeechRecognition({
  lang = 'en-US',
  continuous = false,
  interimResults = true,
  onResult,
  onInterim,
  onError,
  onEnd
} = {}) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return {
      start: () => console.warn('Speech recognition not supported'),
      stop: () => {},
      isSupported: false,
      recognition: null
    };
  }

  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.continuous = continuous;
  recognition.interimResults = interimResults;

  recognition.onresult = (event) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    if (finalTranscript) {
      onResult?.(finalTranscript);
    }
    if (interimTranscript) {
      onInterim?.(interimTranscript);
    }
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    onError?.(event.error);
  };

  recognition.onend = () => {
    onEnd?.();
  };

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
    isSupported: true,
    recognition
  };
}
