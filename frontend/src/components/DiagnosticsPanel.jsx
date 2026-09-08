import React from 'react';
import { Activity, ShieldAlert, Cpu, CheckCircle2, AlertTriangle, Zap, Clock } from 'lucide-react';

export default function DiagnosticsPanel({ diagnostics }) {
  const {
    activeRequestId,
    currentState,
    interruptionCount,
    staleDiscardedCount,
    rimeStatus,
    lastLatencyMs,
    recognitionMs,
    taskMs,
    ttsMs,
    totalMs,
    lastError
  } = diagnostics;

  return (
    <div className="w-full glass-panel rounded-2xl border border-zinc-800 p-4 shadow-xl flex flex-col gap-3 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-[#FFD400]" />
          <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            System Diagnostics & Observability
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/30 font-bold">
          LATENCY INSTRUMENTED
        </span>
      </div>

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        <div className="p-2.5 rounded-xl glass-card border border-zinc-800 flex flex-col gap-0.5">
          <span className="text-[9px] text-slate-400">ACTIVE REQUEST ID</span>
          <span className="text-[#FFB800] font-bold truncate text-[11px]">{activeRequestId || 'req-init'}</span>
        </div>

        <div className="p-2.5 rounded-xl glass-card border border-zinc-800 flex flex-col gap-0.5">
          <span className="text-[9px] text-slate-400">CORE STATE</span>
          <span className="text-[#FFD400] font-bold uppercase text-[11px]">{currentState}</span>
        </div>

        <div className="p-2.5 rounded-xl glass-card border border-zinc-800 flex flex-col gap-0.5">
          <span className="text-[9px] text-slate-400">INTERRUPTIONS</span>
          <span className="text-amber-400 font-bold text-[11px]">{interruptionCount}</span>
        </div>

        <div className="p-2.5 rounded-xl glass-card border border-zinc-800 flex flex-col gap-0.5">
          <span className="text-[9px] text-slate-400">STALE DISCARDED</span>
          <span className="text-red-400 font-bold text-[11px]">{staleDiscardedCount}</span>
        </div>

        <div className="p-2.5 rounded-xl glass-card border border-zinc-800 flex flex-col gap-0.5">
          <span className="text-[9px] text-slate-400">RIME ENGINE</span>
          <span className={`font-bold text-[11px] ${rimeStatus ? 'text-emerald-400' : 'text-amber-400'}`}>
            {rimeStatus ? 'ONLINE' : 'UNCONFIGURED'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl glass-card border border-zinc-800 flex flex-col gap-0.5">
          <span className="text-[9px] text-slate-400">TOTAL LATENCY</span>
          <span className="text-emerald-400 font-bold text-[11px]">{totalMs || lastLatencyMs ? `${totalMs || lastLatencyMs} ms` : '--'}</span>
        </div>
      </div>

      {/* Measured Latency Breakdown Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-zinc-800/80">
        <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Clock size={10} className="text-[#FFD400]"/> Recognition:
          </span>
          <strong className="text-[#FFD400]">{recognitionMs !== null && recognitionMs !== undefined ? `${recognitionMs} ms` : '--'}</strong>
        </div>

        <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Clock size={10} className="text-[#FFB800]"/> Task Execution:
          </span>
          <strong className="text-[#FFB800]">{taskMs !== null && taskMs !== undefined ? `${taskMs} ms` : '--'}</strong>
        </div>

        <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Clock size={10} className="text-emerald-400"/> Rime TTS API:
          </span>
          <strong className="text-emerald-300">{ttsMs !== null && ttsMs !== undefined ? `${ttsMs} ms` : '--'}</strong>
        </div>

        <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Clock size={10} className="text-[#FFD400]"/> Total Latency:
          </span>
          <strong className="text-emerald-400">{totalMs !== null && totalMs !== undefined ? `${totalMs} ms` : '--'}</strong>
        </div>
      </div>

      {/* Error alert banner if any error occurred */}
      {lastError && (
        <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-[11px] flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-400 shrink-0" />
          <span className="truncate">{lastError}</span>
        </div>
      )}
    </div>
  );
}
