import React from 'react';
import { Activity, Radio, Settings, Zap } from 'lucide-react';

export default function TopBar({ healthData, onOpenConfig }) {
  const rimeStatus = healthData?.rime?.configured;
  const modelName = healthData?.rime?.default_model || 'coda';
  const speakerName = healthData?.rime?.default_speaker || 'astra';

  return (
    <header className="w-full h-16 border-b border-[#FFD400]/15 bg-[#050505]/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand logo & tagline */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFD400]/25 to-[#FFB800]/20 border border-[#FFD400]/40 shadow-glow-yellow">
          <div className="w-4 h-4 rounded-full bg-[#FFD400] animate-pulse"></div>
          <div className="absolute inset-0 rounded-xl border border-[#FFD400]/50 animate-ping opacity-30"></div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-wider text-white font-mono bg-gradient-to-r from-white via-amber-100 to-[#FFD400] bg-clip-text text-transparent">
              VOICEOPS
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#FFD400]/20 text-[#FFD400] border border-[#FFD400]/40">
              RIME NATIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">DATAFORGE 2026 • Real-time Voice Cockpit</p>
        </div>
      </div>

      {/* Rime Status & Metrics */}
      <div className="flex items-center gap-4">
        {/* Rime Connection Badge */}
        <div 
          onClick={onOpenConfig}
          className="cursor-pointer flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg glass-card border border-zinc-800 hover:border-[#FFD400]/50 transition-all duration-200 group"
          title="Click to view Rime Engine Configuration"
        >
          <div className="relative flex items-center justify-center">
            {rimeStatus ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
              </>
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-100 font-mono">
                {rimeStatus ? 'Rime Connected' : 'Rime Setup Required'}
              </span>
              <Settings size={12} className="text-slate-400 group-hover:text-[#FFD400] transition-colors" />
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
              <span>Model: <strong className="text-[#FFD400] font-bold">{modelName}</strong></span>
              <span>•</span>
              <span>Speaker: <strong className="text-[#FFB800] font-bold">{speakerName}</strong></span>
            </div>
          </div>
        </div>

        {/* Latency metric pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card text-xs font-mono text-slate-300 border border-zinc-800">
          <Activity size={14} className="text-[#FFD400] animate-pulse" />
          <span>Latency: <strong className="text-emerald-400 font-bold">14ms</strong></span>
        </div>

        {/* System Session Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card text-xs font-mono text-slate-300 border border-zinc-800">
          <Radio size={14} className="text-[#FFB800]" />
          <span>Session: <strong className="text-slate-200">#OPS-9482</strong></span>
        </div>
      </div>
    </header>
  );
}
