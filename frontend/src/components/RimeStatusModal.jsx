import React from 'react';
import { X, CheckCircle, AlertTriangle, Shield, Key, ExternalLink } from 'lucide-react';

export default function RimeStatusModal({ isOpen, onClose, healthData }) {
  if (!isOpen) return null;

  const rime = healthData?.rime || {};
  const isConfigured = rime.configured;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl glass-panel rounded-2xl border border-zinc-800 p-6 flex flex-col gap-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="p-3 rounded-xl bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/30">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="font-mono text-base font-bold text-white">
              Rime Engine Observability
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Speech Synthesis Infrastructure Configuration
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div className={`p-4 rounded-xl border font-mono text-xs flex items-start gap-3 ${
          isConfigured
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
            : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
        }`}>
          {isConfigured ? (
            <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="flex flex-col gap-1">
            <strong className="text-sm">
              {isConfigured ? 'Rime API Credentials Verified' : 'Rime API Key Missing or Default'}
            </strong>
            <p className="text-xs opacity-90">
              {isConfigured
                ? 'Backend is connected and authorized to call Rime TTS API endpoints directly.'
                : 'To synthesize live speech with Rime, please set your RIME_API_KEY in backend/.env'}
            </p>
          </div>
        </div>

        {/* Config Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl glass-card border border-zinc-800 flex flex-col gap-1">
            <span className="text-slate-400 text-[10px]">API ENDPOINT</span>
            <span className="text-[#FFD400] font-semibold truncate">{rime.endpoint || 'https://users.rime.ai/v1/rime-tts'}</span>
          </div>

          <div className="p-3 rounded-xl glass-card border border-zinc-800 flex flex-col gap-1">
            <span className="text-slate-400 text-[10px]">ACTIVE MODEL ID</span>
            <span className="text-[#FFB800] font-semibold">{rime.default_model || 'coda'}</span>
          </div>

          <div className="p-3 rounded-xl glass-card border border-zinc-800 flex flex-col gap-1">
            <span className="text-slate-400 text-[10px]">ACTIVE SPEAKER</span>
            <span className="text-[#FFD400] font-semibold">{rime.default_speaker || 'astra'}</span>
          </div>

          <div className="p-3 rounded-xl glass-card border border-zinc-800 flex flex-col gap-1">
            <span className="text-slate-400 text-[10px]">AUDIO FORMAT</span>
            <span className="text-slate-200 font-semibold">{rime.audio_format || 'audio/mpeg'}</span>
          </div>
        </div>

        {/* Configuration Setup Guide */}
        <div className="p-4 rounded-xl bg-[#050505] border border-zinc-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1.5 text-[#FFD400] font-bold">
              <Key size={14} /> How to configure RIME_API_KEY
            </span>
            <a
              href="https://rime.ai"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-slate-400 hover:text-[#FFD400] flex items-center gap-1"
            >
              Get Rime Key <ExternalLink size={10} />
            </a>
          </div>

          <div className="bg-zinc-900 p-3 rounded-lg border border-zinc-800 text-[11px] font-mono text-slate-300 flex flex-col gap-1">
            <span className="text-slate-400">1. Open <code className="text-[#FFD400]">voiceops-rime/backend/.env</code></span>
            <span className="text-slate-400">2. Set line:</span>
            <code className="text-emerald-400 bg-black p-1.5 rounded border border-zinc-800">
              RIME_API_KEY=rime_your_actual_api_key_here
            </code>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-mono text-xs font-semibold border border-zinc-800 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
