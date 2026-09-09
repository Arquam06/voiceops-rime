import React from 'react';
import { MessageSquare, User, Bot, Trash2, Sparkles, Clock } from 'lucide-react';

export default function ConversationPanel({
  conversationHistory = [],
  sessionId = 'session-100',
  onClearHistory
}) {
  return (
    <div className="w-full glass-panel rounded-2xl border border-zinc-800 p-5 shadow-2xl flex flex-col gap-4 max-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/30">
            <MessageSquare size={16} />
          </div>
          <div>
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              Conversational Memory
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Session Context: <span className="text-[#FFD400] font-bold">{sessionId}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onClearHistory}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-red-950/40 text-slate-400 hover:text-red-300 border border-zinc-800 hover:border-red-500/40 text-[11px] font-mono transition-colors"
          title="Clear Short-Term Session Context"
        >
          <Trash2 size={12} />
          <span>Clear Memory</span>
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 custom-scrollbar">
        {conversationHistory.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center justify-center gap-2 text-slate-500 font-mono text-xs">
            <Sparkles size={24} className="text-zinc-700 animate-pulse" />
            <p>No conversation history yet.</p>
            <p className="text-[10px] text-zinc-600">
              Speak or ask any question (e.g. "What is quantum computing?") to begin.
            </p>
          </div>
        ) : (
          conversationHistory.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-2 font-mono text-xs">
              {/* User Message */}
              <div className="self-end max-w-[85%] bg-zinc-900 border border-zinc-800 p-3 rounded-2xl rounded-tr-none text-slate-200 flex flex-col gap-1 shadow-md">
                <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 text-[#FFD400]">
                    <User size={10} /> User Voice
                  </span>
                  <span>{item.timestamp}</span>
                </div>
                <p className="text-slate-100">{item.userText}</p>
              </div>

              {/* AI Assistant Spoken Answer */}
              <div className="self-start max-w-[90%] bg-zinc-950 border border-[#FFD400]/30 p-3 rounded-2xl rounded-tl-none text-slate-100 flex flex-col gap-1.5 shadow-glow-yellow">
                <div className="flex items-center justify-between gap-2 text-[10px] text-[#FFD400]">
                  <span className="flex items-center gap-1 font-bold">
                    <Bot size={11} /> VoiceOps AI (Rime Synthesis)
                  </span>
                  <span className="text-slate-500">{item.provider || 'Rime Powered'}</span>
                </div>
                <p className="text-slate-200 leading-relaxed">{item.answerText}</p>
                {item.speechText && item.speechText !== item.answerText && (
                  <div className="text-[10px] p-2 rounded bg-zinc-900/80 border border-zinc-800 text-slate-400 flex items-start gap-1">
                    <Clock size={10} className="text-[#FFD400] shrink-0 mt-0.5" />
                    <span>Rime Spoken Payload: "{item.speechText}"</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
