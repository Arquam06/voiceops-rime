import React from 'react';
import { Terminal, User, Volume2, Cpu } from 'lucide-react';

export default function EventTimelinePanel({ events = [] }) {
  const defaultEvents = [
    {
      id: 1,
      timestamp: '18:42:10.104',
      type: 'SYSTEM',
      label: 'VoiceOps Engine Online',
      detail: 'Rime TTS Speech Infrastructure Ready (Model: coda, Speaker: astra)',
      icon: Cpu,
      color: 'text-[#FFD400]',
    }
  ];

  const displayEvents = events.length > 0 ? events : defaultEvents;

  return (
    <aside className="w-full lg:w-96 glass-panel rounded-2xl border border-zinc-800 p-4 flex flex-col gap-4 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-[#FFD400]" />
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            Event & Audit Timeline
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/30 font-bold">
          REALTIME AUDIT
        </span>
      </div>

      {/* Events List */}
      <div className="flex flex-col gap-3 overflow-y-auto max-h-[520px] pr-1">
        {displayEvents.map((evt) => {
          const IconComponent = evt.icon || Terminal;
          let badgeStyle = "bg-zinc-900 text-zinc-300 border border-zinc-800";
          let bulletColor = "bg-[#FFD400]";
          
          if (evt.type === 'USER') {
            badgeStyle = "bg-[#FFD400]/20 text-[#FFD400] border border-[#FFD400]/40 font-bold";
            bulletColor = "bg-[#FFD400]";
          } else if (evt.type === 'AGENT') {
            badgeStyle = "bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/40 font-bold";
            bulletColor = "bg-[#FFB800]";
          } else if (evt.type === 'INTERRUPT') {
            badgeStyle = "bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse font-bold";
            bulletColor = "bg-red-500";
          } else if (evt.type === 'STALE_DISCARD') {
            badgeStyle = "bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold shadow-glow-yellow";
            bulletColor = "bg-amber-400";
          } else if (evt.type === 'SYSTEM') {
            badgeStyle = "bg-zinc-900 text-zinc-400 border border-zinc-800";
            bulletColor = "bg-zinc-500";
          }

          return (
            <div key={evt.id} className="relative pl-6 pb-2 border-l border-[#FFD400]/25 last:border-0">
              {/* Timeline Bullet */}
              <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-[#050505] border border-[#FFD400]/60 flex items-center justify-center">
                <div className={`w-1.5 h-1.5 rounded-full ${bulletColor}`}></div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-zinc-400">{evt.timestamp}</span>
                  <span className={`px-1.5 py-0.2 rounded uppercase ${badgeStyle}`}>
                    {evt.type}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-100">
                  <IconComponent size={13} className={evt.color || 'text-[#FFD400]'} />
                  <span>{evt.label}</span>
                </div>
                <p className="text-[11px] text-slate-300 font-mono bg-zinc-900/80 p-2 rounded border border-zinc-800/80 mt-0.5">
                  {evt.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
