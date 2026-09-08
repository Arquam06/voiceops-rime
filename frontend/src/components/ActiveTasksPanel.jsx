import React from 'react';
import { Server, Database, Activity, ShieldAlert, Clock, CheckCircle2, XCircle, RefreshCw, Play } from 'lucide-react';

export default function ActiveTasksPanel({ taskStates = {}, onTriggerTask, activeRequestId }) {
  const defaultTasks = [
    {
      id: 'deployment',
      name: 'Deployment Check',
      subtext: 'Kubernetes Cluster us-east-1',
      defaultDelay: 0.2,
      icon: Server,
    },
    {
      id: 'database',
      name: 'Database Status',
      subtext: 'PostgreSQL Replica Health & Lag',
      defaultDelay: 0.2,
      icon: Database,
    },
    {
      id: 'microservice',
      name: 'Microservice Health',
      subtext: 'API Gateway & Auth Token Service',
      defaultDelay: 0.2,
      icon: Activity,
    },
    {
      id: 'incident',
      name: 'Incident Status',
      subtext: 'INC-8921 High Memory Utilization',
      defaultDelay: 0.2,
      icon: ShieldAlert,
    }
  ];

  return (
    <aside className="w-full lg:w-80 glass-panel rounded-2xl border border-zinc-800 p-4 flex flex-col gap-4 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[#FFD400]" />
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            Active Operations
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/30 font-bold">
          4 TARGETS
        </span>
      </div>

      {/* Task Cards Container */}
      <div className="flex flex-col gap-3 overflow-y-auto max-h-[520px] pr-1">
        {defaultTasks.map((taskDef) => {
          const IconComponent = taskDef.icon;
          const liveState = taskStates[taskDef.id] || { status: 'idle', startTime: '--', duration: `${taskDef.defaultDelay}s`, requestId: '--' };

          let statusBadge = (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 font-bold">
              STANDBY
            </span>
          );
          let cardBorder = "border-zinc-800 hover:border-[#FFD400]/40 hover:bg-zinc-900/60 cursor-pointer";

          if (liveState.status === 'running') {
            statusBadge = (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFD400]/20 text-[#FFD400] border border-[#FFD400]/50 flex items-center gap-1 animate-pulse font-bold">
                <RefreshCw size={10} className="animate-spin text-[#FFD400]" /> RUNNING
              </span>
            );
            cardBorder = "border-[#FFD400]/60 shadow-glow-yellow bg-[#FFD400]/5";
          } else if (liveState.status === 'completed') {
            statusBadge = (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-bold">
                <CheckCircle2 size={10} /> COMPLETED
              </span>
            );
            cardBorder = "border-emerald-500/40 bg-emerald-950/10";
          } else if (liveState.status === 'invalidated' || liveState.status === 'stale') {
            statusBadge = (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1 font-bold">
                <XCircle size={10} /> INVALIDATED
              </span>
            );
            cardBorder = "border-red-500/40 bg-red-950/10";
          }

          return (
            <div
              key={taskDef.id}
              onClick={() => onTriggerTask(taskDef.id, taskDef.defaultDelay)}
              className={`glass-card p-3.5 rounded-xl border ${cardBorder} transition-all duration-200 flex flex-col gap-2.5 group`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-zinc-900 text-[#FFD400] border border-zinc-800 group-hover:border-[#FFD400]/50 transition-colors">
                    <IconComponent size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold font-mono text-white group-hover:text-[#FFD400] transition-colors flex items-center gap-1">
                      {taskDef.name}
                      <Play size={10} className="opacity-0 group-hover:opacity-100 text-[#FFD400] transition-opacity" />
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {taskDef.subtext}
                    </p>
                  </div>
                </div>
                {statusBadge}
              </div>

              {/* Task Operational Details */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-zinc-800/80">
                <span>Start: <strong className="text-slate-300">{liveState.startTime || '--'}</strong></span>
                <span>Delay: <strong className="text-slate-300">{liveState.duration || `${taskDef.defaultDelay}s`}</strong></span>
                <span className="text-[#FFB800] font-bold">{liveState.requestId || '--'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
