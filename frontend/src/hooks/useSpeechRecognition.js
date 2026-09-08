import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechRecognition({ onResult, onInterimSpeech, onError, currentSpeakingText }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const recognitionStartTimeRef = useRef(null);
  const hasTriggeredRef = useRef(false);
  const isVoiceModeActiveRef = useRef(false);
  
  const lastProcessedTranscriptRef = useRef('');
  const lastProcessedTimeRef = useRef(0);
  const currentSpeakingTextRef = useRef(currentSpeakingText);

  useEffect(() => {
    currentSpeakingTextRef.current = currentSpeakingText;
  }, [currentSpeakingText]);

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  // Safe echo detection algorithm
  const isEchoOfSystemOutput = (userText) => {
    if (!currentSpeakingTextRef.current) return false;
    const systemText = currentSpeakingTextRef.current.toLowerCase();
    const cleanUser = userText.toLowerCase().trim();
    if (!cleanUser || cleanUser.length < 3) return false;

    // Check direct inclusion or token overlap
    if (systemText.includes(cleanUser)) return true;

    const userWords = cleanUser.split(/\s+/);
    const systemWords = systemText.split(/\s+/);
    let matchCount = 0;
    for (const w of userWords) {
      if (w.length > 3 && systemWords.includes(w)) {
        matchCount++;
      }
    }
    const overlapRatio = matchCount / userWords.length;
    return overlapRatio > 0.75;
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      recognitionStartTimeRef.current = performance.now();
      hasTriggeredRef.current = false;
    };

    recognition.onresult = (event) => {
      clearSilenceTimer();
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      const trimmedText = currentTranscript.trim();
      if (!trimmedText) return;

      setTranscript(trimmedText);

      // Check echo
      if (isEchoOfSystemOutput(trimmedText)) {
        return;
      }

      // Notify interim speech if provided (for instant interruption)
      if (onInterimSpeech) {
        onInterimSpeech(trimmedText);
      }

      const isFinal = event.results[event.results.length - 1].isFinal;

      const triggerResult = (text) => {
        if (hasTriggeredRef.current || !text) return;

        // Duplicate prevention check (Problem 5 & 15 - TEST 06)
        const now = performance.now();
        if (
          lastProcessedTranscriptRef.current === text.toLowerCase() &&
          now - lastProcessedTimeRef.current < 2500
        ) {
          return;
        }

        hasTriggeredRef.current = true;
        lastProcessedTranscriptRef.current = text.toLowerCase();
        lastProcessedTimeRef.current = now;
        clearSilenceTimer();

        const durationMs = Math.round(now - (recognitionStartTimeRef.current || now));
        
        if (onResult) {
          onResult(text, durationMs);
        }
      };

      if (isFinal) {
        triggerResult(trimmedText);
      } else if (trimmedText.length > 2) {
        // Fast 400ms silence detection timer
        silenceTimerRef.current = setTimeout(() => {
          triggerResult(trimmedText);
        }, 400);
      }
    };

    recognition.onerror = (event) => {
      clearSilenceTimer();
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn("Speech Recognition Error:", event.error);
        if (onError) onError(event.error);
      }
    };

    recognition.onend = () => {
      clearSilenceTimer();
      setIsListening(false);

      // Automatic Continuous Conversation Restart (Problem 2)
      if (isVoiceModeActiveRef.current) {
        setTimeout(() => {
          if (isVoiceModeActiveRef.current) {
            try {
              recognition.start();
            } catch (err) {}
          }
        }, 150);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      clearSilenceTimer();
      isVoiceModeActiveRef.current = false;
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [onResult, onInterimSpeech, onError]);

  const startListening = useCallback(() => {
    isVoiceModeActiveRef.current = true;
    clearSilenceTimer();
    setTranscript('');
    hasTriggeredRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {}
    }
  }, []);

  const stopListening = useCallback(() => {
    isVoiceModeActiveRef.current = false;
    clearSilenceTimer();
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    isVoiceModeActive: isVoiceModeActiveRef.current
  };
}
