import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Square, Mic, MicOff, Send, Sparkles, RefreshCw, AlertCircle, Radio, Zap } from 'lucide-react';
import { synthesizeSpeech, interruptTask } from '../services/api';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

export default function VoiceWorkbench({
  onStateChange,
  onLogEvent,
  rimeConfig,
  activeRequestId,
  onTriggerVoiceQuery,
  onInterruptCurrentAudio,
  onAudioEnded,
  currentSpeakingText
}) {
  const [promptText, setPromptText] = useState('Check deployment status for microservices in cluster us-east-1.');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [audioMetadata, setAudioMetadata] = useState(null);

  const audioRef = useRef(null);
  const visualizerCanvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  const quickPrompts = [
    "What is quantum computing?",
    "Explain DBMS normalization in simple terms.",
    "Check deployment status for microservices.",
    "Check database replication health and slave latency."
  ];

  // Speech Recognition Hook Integration
  const { isListening, transcript, isSupported, startListening, stopListening, isVoiceModeActive } = useSpeechRecognition({
    currentSpeakingText: currentSpeakingText,
    onInterimSpeech: (interimText) => {
      // Automatic Voice Interruption (Problem 3 & TEST 05)
      if (isPlaying) {
        onLogEvent({
          type: 'INTERRUPT',
          label: 'Automatic Speech Interruption Detected',
          detail: `User spoke "${interimText}" while Rime audio playing. Stopping playback immediately!`,
          icon: Zap,
          color: 'text-red-400'
        });
        handleStopAudio(true);
      }
    },
    onResult: (finalText, recDurationMs) => {
      setPromptText(finalText);
      onLogEvent({
        type: 'USER',
        label: 'Voice Transcript Captured',
        detail: `"${finalText}" (${recDurationMs}ms capture)`,
        icon: Mic,
        color: 'text-[#FFD400]'
      });
      // Automatically process spoken query hands-free
      onTriggerVoiceQuery(finalText, recDurationMs);
    },
    onError: (err) => {
      onLogEvent({
        type: 'SYSTEM',
        label: 'Speech Recognition Warning',
        detail: `Microphone issue: ${err}`,
        icon: AlertCircle,
        color: 'text-amber-400'
      });
    }
  });

  // Handle Speech Recognition Toggle (Hands-Free Voice Mode ON/OFF)
  const handleMicToggle = () => {
    if (isPlaying) {
      handleStopAudio(true);
    }

    if (isListening) {
      stopListening();
      onStateChange('IDLE', 'Hands-Free Voice Mode Stopped');
    } else {
      startListening();
      onStateChange('LISTENING', 'Hands-Free Voice Mode Active • Listening...');
    }
  };

  // Real-time Audio Spectrum Visualizer (Neon Yellow/Gold Gradient)
  useEffect(() => {
    if (!audioRef.current || !isPlaying) return;

    try {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64;
        
        const source = audioContextRef.current.createMediaElementSource(audioRef.current);
        source.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }

      const canvas = visualizerCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const drawVisualizer = () => {
        animFrameRef.current = requestAnimationFrame(drawVisualizer);
        analyserRef.current.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;
        let totalAmp = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          totalAmp += dataArray[i];

          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, '#FFD400');
          gradient.addColorStop(1, '#FFB800');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

          x += barWidth + 2;
        }

        const avgAmp = totalAmp / bufferLength;
        onStateChange('SPEAKING', `Rime Audio Output Active (Amplitude: ${Math.round(avgAmp)})`, avgAmp);
      };

      drawVisualizer();

      return () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
    } catch (e) {
      console.warn("Audio Visualizer fallback:", e);
    }
  }, [isPlaying]);

  // Direct Rime Speech Synthesis Call ("Test Rime Voice")
  const handleTestRimeVoice = async (textToSynthesize) => {
    const text = textToSynthesize || promptText;
    if (!text || !text.trim()) return;

    if (isPlaying) {
      handleStopAudio(true);
    }

    setIsSynthesizing(true);
    setErrorMessage(null);
    onStateChange('THINKING', 'Sending payload to Rime TTS API...');
    
    const startTime = performance.now();

    onLogEvent({
      type: 'USER',
      label: 'Rime Synthesis Direct Request',
      detail: `Text: "${text}"`,
      icon: Send
    });

    try {
      const result = await synthesizeSpeech(text, {
        speaker: rimeConfig?.default_speaker,
        modelId: rimeConfig?.default_model,
        lang: rimeConfig?.default_lang,
        requestId: activeRequestId || `req-${Date.now()}`
      });

      const elapsed = (performance.now() - startTime).toFixed(0);

      setAudioUrl(result.audioUrl);
      setAudioMetadata({
        speaker: result.speaker || rimeConfig?.default_speaker || 'astra',
        model: result.model || rimeConfig?.default_model || 'coda',
        elapsedMs: elapsed
      });

      onLogEvent({
        type: 'AGENT',
        label: 'Rime Audio Payload Received',
        detail: `Model: ${result.model || 'coda'} | Speaker: ${result.speaker || 'astra'} | Latency: ${elapsed}ms`,
        icon: Volume2,
        color: 'text-emerald-400'
      });

      setIsSynthesizing(false);

      if (audioRef.current) {
        audioRef.current.src = result.audioUrl;
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            onStateChange('SPEAKING', 'Playing Rime Speech Output');
          })
          .catch((playErr) => {
            console.error("Audio playback error:", playErr);
            setIsPlaying(false);
            onStateChange('IDLE', 'Audio Ready (Click play button)');
          });
      }

    } catch (err) {
      console.error("Rime Synthesis Error:", err);
      setIsSynthesizing(false);
      setIsPlaying(false);

      const errDetails = err.details?.message || err.message || 'Speech synthesis failed';
      setErrorMessage(errDetails);
      onStateChange('ERROR', `Rime API Error: ${errDetails}`);

      onLogEvent({
        type: 'SYSTEM',
        label: 'Rime Synthesis Error',
        detail: errDetails,
        icon: AlertCircle,
        color: 'text-red-400'
      });
    }
  };

  // Immediate Audio Interruption & Cutoff
  const handleStopAudio = (wasInterrupted = false) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);

    if (wasInterrupted) {
      onInterruptCurrentAudio();
    } else {
      onStateChange('IDLE', 'Audio Playback Stopped');
      onLogEvent({
        type: 'SYSTEM',
        label: 'Audio Stopped',
        detail: 'Playback stopped by user',
        icon: Square
      });
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl border border-zinc-800 p-6 flex flex-col gap-6 shadow-2xl">
      {/* Header & Main Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/30">
            <Radio size={18} />
          </div>
          <div>
            <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              Voice Operational Cockpit
              {isListening && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFD400]/20 text-[#FFD400] border border-[#FFD400]/40 font-mono animate-pulse">
                  HANDS-FREE ACTIVE
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Automatic Voice Loop • Speak → Operational Intent → Rime Synthesis → Auto-Listen
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Neon Yellow Hands-Free Microphone Toggle Button */}
          <button
            onClick={handleMicToggle}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all duration-200 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-glow-red'
                : isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-[#FFD400] text-black hover:bg-[#FFE600] shadow-glow-yellow active:scale-95'
            }`}
            title={isListening ? "Click to Stop Hands-Free Voice Mode" : "Click to Start Hands-Free Voice Mode"}
          >
            {isListening ? (
              <>
                <MicOff size={14} />
                <span>Stop Voice Mode</span>
              </>
            ) : isPlaying ? (
              <>
                <Zap size={14} className="text-amber-400 animate-bounce" />
                <span>Interrupt Speech</span>
              </>
            ) : (
              <>
                <Mic size={14} />
                <span>Start Hands-Free Voice</span>
              </>
            )}
          </button>

          {/* Test Rime Voice Button */}
          <button
            onClick={() => handleTestRimeVoice()}
            disabled={isSynthesizing}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all duration-200 ${
              isSynthesizing
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                : 'bg-gradient-to-r from-[#FFD400] to-[#FFB800] text-black hover:opacity-95 shadow-glow-yellow active:scale-95'
            }`}
          >
            {isSynthesizing ? (
              <>
                <RefreshCw size={14} className="animate-spin text-[#FFD400]" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Test Rime Voice</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Recognized Speech Transcript Box */}
      {transcript && (
        <div className="p-3 rounded-xl bg-[#FFD400]/10 border border-[#FFD400]/40 text-[#FFD400] text-xs font-mono flex items-center justify-between gap-2 shadow-glow-yellow">
          <div className="flex items-center gap-2">
            <Mic size={14} className="text-[#FFD400] animate-pulse" />
            <span>Captured Voice Input: <strong>"{transcript}"</strong></span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFD400]/20 text-[#FFD400] font-bold border border-[#FFD400]/40">RECOGNIZED</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono flex items-start gap-3">
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <strong className="text-red-200">Rime Speech Synthesis Notice</strong>
            <span>{errorMessage}</span>
            {!rimeConfig?.configured && (
              <span className="text-[11px] text-slate-400">
                Set your <code className="text-[#FFD400]">RIME_API_KEY</code> in <code className="text-slate-300">backend/.env</code> to enable live speech.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Prompt Text Input */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
          <span>Operational Prompt Input:</span>
          <span className="text-[10px] text-[#FFD400] font-normal">Real-Time Hands-Free Voice Engine</span>
        </label>
        <div className="relative">
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={2}
            className="w-full bg-[#050505]/95 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-[#FFD400] transition-colors resize-none"
            placeholder="Speak or type an operational query (e.g. Check deployment status)..."
          />
        </div>
      </div>

      {/* Quick Operational Prompts */}
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => {
              setPromptText(prompt);
              onTriggerVoiceQuery(prompt);
            }}
            className="text-[11px] font-mono px-3 py-1.5 rounded-lg glass-card border border-zinc-800 hover:border-[#FFD400]/50 text-slate-300 hover:text-[#FFD400] transition-all text-left"
          >
            "{prompt}"
          </button>
        ))}
      </div>

      {/* Audio Visualizer & Player Section */}
      <div className="p-4 rounded-xl glass-card border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Real-time Spectrum Canvas */}
        <div className="flex items-center gap-3 w-full md:w-1/2">
          <canvas
            ref={visualizerCanvasRef}
            width={240}
            height={40}
            className="w-full h-10 rounded-lg bg-[#050505] border border-zinc-800"
          ></canvas>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <audio
            ref={audioRef}
            onEnded={() => {
              setIsPlaying(false);
              onStateChange('LISTENING', 'Hands-Free Listening Active');
              if (onAudioEnded) onAudioEnded();
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="hidden"
          />

          {isPlaying ? (
            <button
              onClick={() => handleStopAudio(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-mono font-semibold hover:bg-red-500/30 transition-colors"
            >
              <Square size={14} /> Stop / Interrupt Audio
            </button>
          ) : (
            <button
              onClick={() => {
                if (audioRef.current && audioUrl) {
                  audioRef.current.play();
                } else {
                  handleTestRimeVoice();
                }
              }}
              disabled={!audioUrl}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold transition-colors ${
                audioUrl
                  ? 'bg-zinc-900 text-[#FFD400] border border-zinc-800 hover:border-[#FFD400]/50'
                  : 'bg-zinc-900/60 text-zinc-600 border border-zinc-800 cursor-not-allowed'
              }`}
            >
              <Play size={14} /> Play Last Audio
            </button>
          )}

          {/* Rime Latency Pill */}
          {audioMetadata && (
            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800">
              <span>TTS Latency: <strong className="text-emerald-400">{audioMetadata.elapsedMs}ms</strong></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
