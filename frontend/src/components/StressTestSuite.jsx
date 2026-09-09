import React, { useState } from 'react';
import { Play, ShieldAlert, CheckCircle2, XCircle, RefreshCw, Zap, Flame, Repeat, ShieldCheck, VolumeX, MessageSquare, HelpCircle, RotateCcw, Volume2 } from 'lucide-react';

export default function StressTestSuite({
  onRunTest1,
  onRunTest2,
  onRunTest3,
  onRunTest4,
  onRunTest5,
  onRunTest6,
  onRunTest7,
  onRunTest8,
  onRunTest9,
  onRunTest10,
  testResults
}) {
  const [runningTest, setRunningTest] = useState(null);

  const handleTest = async (testId, testFunc) => {
    if (!testFunc) return;
    setRunningTest(testId);
    try {
      await testFunc();
    } finally {
      setRunningTest(null);
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl border border-zinc-800 p-5 shadow-2xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/30">
            <Flame size={16} />
          </div>
          <div>
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              Hackathon Evaluation & Stress Test Suite
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              10 Deterministic verification scenarios for judges to evaluate hard voice mechanics
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFD400]/10 text-[#FFD400] border border-[#FFD400]/30 font-bold">
          10/10 EVALUATION SUITE ACTIVE
        </span>
      </div>

      {/* Test Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        
        {/* TEST 1: Normal Flow */}
        <div className="glass-card p-3.5 rounded-xl border border-zinc-800 flex flex-col justify-between gap-3 hover:border-[#FFD400]/50 transition-colors">
          <div className="flex flex-col gap-1 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#FFD400]">TEST 01 • Normal Flow</span>
              {testResults?.test1 === true && <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle2 size={12}/> PASS</span>}
              {testResults?.test1 === false && <span className="text-[10px] text-red-400 flex items-center gap-1 font-bold"><XCircle size={12}/> FAIL</span>}
            </div>
            <p className="text-[10px] text-slate-400">
              User asks query → Task executes → Rime synthesizes speech → Spoken output.
            </p>
          </div>

          <button
            onClick={() => handleTest(1, onRunTest1)}
            disabled={runningTest !== null}
            className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[#FFD400] border border-zinc-800 hover:border-[#FFD400]/50 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {runningTest === 1 ? <RefreshCw size={12} className="animate-spin text-[#FFD400]"/> : <Play size={12}/>}
            <span>Run Test 01</span>
          </button>
        </div>

        {/* TEST 2: Voice Interruption */}
        <div className="glass-card p-3.5 rounded-xl border border-zinc-800 flex flex-col justify-between gap-3 hover:border-[#FFD400]/50 transition-colors">
          <div className="flex flex-col gap-1 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#FFB800]">TEST 02 • Voice Interruption</span>
              {testResults?.test2 === true && <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle2 size={12}/> PASS</span>}
              {testResults?.test2 === false && <span className="text-[10px] text-red-400 flex items-center gap-1 font-bold"><XCircle size={12}/> FAIL</span>}
            </div>
            <p className="text-[10px] text-slate-400">
              Starts Task A → Interrupt mid-speech → Audio cuts off immediately → Task B speaks.
            </p>
          </div>

          <button
            onClick={() => handleTest(2, onRunTest2)}
            disabled={runningTest !== null}
            className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[#FFB800] border border-zinc-800 hover:border-[#FFB800]/50 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {runningTest === 2 ? <RefreshCw size={12} className="animate-spin text-[#FFB800]"/> : <Zap size={12}/>}
            <span>Run Test 02</span>
          </button>
        </div>

        {/* TEST 3: Stale Result Discard */}
        <div className="glass-card p-3.5 rounded-xl border border-zinc-800 flex flex-col justify-between gap-3 hover:border-[#FFD400]/50 transition-colors">
          <div className="flex flex-col gap-1 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#FFD400]">TEST 03 • Stale Discard</span>
              {testResults?.test3 === true && <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle2 size={12}/> PASS</span>}
              {testResults?.test3 === false && <span className="text-[10px] text-red-400 flex items-center gap-1 font-bold"><XCircle size={12}/> FAIL</span>}
            </div>
            <p className="text-[10px] text-slate-400">
              Slow Task A (5s) → Fast Task B (1.5s) → Task B speaks → Task A arrives late & discarded!
            </p>
          </div>

          <button
            onClick={() => handleTest(3, onRunTest3)}
            disabled={runningTest !== null}
            className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[#FFD400] border border-zinc-800 hover:border-[#FFD400]/50 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {runningTest === 3 ? <RefreshCw size={12} className="animate-spin text-[#FFD400]"/> : <ShieldAlert size={12}/>}
            <span>Run Test 03</span>
          </button>
        </div>

        {/* TEST 4: Hands-Free Continuation */}
        <div className="glass-card p-3.5 rounded-xl border border-zinc-800 flex flex-col justify-between gap-3 hover:border-[#FFD400]/50 transition-colors">
          <div className="flex flex-col gap-1 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-400">TEST 04 • Hands-Free Loop</span>
              {testResults?.test4 === true && <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle2 size={12}/> PASS</span>}
            </div>
            <p className="text-[10px] text-slate-400">
              Task 1 completes → Rime finishes → System automatically re-enters LISTENING state.
            </p>
          </div>

          <button
            onClick={() => handleTest(4, onRunTest4)}
            disabled={runningTest !== null}
            className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-cyan-400 border border-zinc-800 hover:border-cyan-400/50 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {runningTest === 4 ? <RefreshCw size={12} className="animate-spin text-cyan-400"/> : <Repeat size={12}/>}
            <span>Run Test 04</span>
          </button>
        </div>

        {/* TEST 5: Automatic Interruption */}
        <div className="glass-card p-3.5 rounded-xl border border-zinc-800 flex flex-col justify-between gap-3 hover:border-[#FFD400]/50 transition-colors">
          <div className="flex flex-col gap-1 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#FFB800]">TEST 05 • Auto Interruption</span>
              {testResults?.test5 === true && <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle2 size={12}/> PASS</span>}
            </div>
            <p className="text-[10px] text-slate-400">
              Rime speaking → Speech detected automatically → Audio cutoff without manual button click.
            </p>
          </div>

          <button
            onClick={() => handleTest(5, onRunTest5)}
            disabled={runningTest !== null}
            className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[#FFB800] border border-zinc-800 hover:border-[#FFB800]/50 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {runningTest === 5 ? <RefreshCw size={12} className="animate-spin text-[#FFB800]"/> : <VolumeX size={12}/>}
            <span>Run Test 05</span>
          </button>
        </div>

        {/* TEST 6: Duplicate Prevention */}
        <div className="glass-card p-3.5 rounded-xl border border-zinc-800 flex flex-col justify-between gap-3 hover:border-[#FFD400]/50 transition-colors">
          <div className="flex flex-col gap-1 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#FFD400]">TEST 06 • Deduplication</span>
              {testResults?.test6 === true && <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle2 size={12}/> PASS</span>}
            </div>
            <p className="text-[10px] text-slate-400">
              Submit same command twice within 2.5s → Duplicate ignored, single execution guaranteed.
            </p>
          </div>

          <button
            onClick={() => handleTest(6, onRunTest6)}
            disabled={runningTest !== null}
            className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[#FFD400] border border-zinc-800 hover:border-[#FFD400]/50 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {runningTest === 6 ? <RefreshCw size={12} className="animate-spin text-[#FFD400]"/> : <ShieldCheck size={12}/>}
            <span>Run Test 06</span>
          </button>
        </div>

        {/* TEST 7: Arbitrary Question */}
        <div className="glass-card p-3.5 rounded-xl border border-zinc-800 flex flex-col justify-between gap-3 hover:border-[#FFD400]/50 transition-colors">
          <div className="flex flex-col gap-1 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#FFD400]">TEST 07 • Arbitrary Query</span>
              {testResults?.test7 === true && <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle2 size={12}/> PASS</span>}
            </div>
            <p className="text-[10px] text-slate-400">
              "What is quantum computing?" → Reasoning service generates answer → Rime speaks.
            </p>
          </div>

          <button
            onClick={() => handleTest(7, onRunTest7)}
            disabled={runningTest !== null}
            className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[#FFD400] border border-zinc-800 hover:border-[#FFD400]/50 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {runningTest === 7 ? <RefreshCw size={12} className="animate-spin text-[#FFD400]"/> : <HelpCircle size={12}/>}
            <span>Run Test 07</span>
          </button>
        </div>

        {/* TEST 8: Follow-Up Context */}
        <div className="glass-card p-3.5 rounded-xl border border-zinc-800 flex flex-col justify-between gap-3 hover:border-[#FFD400]/50 transition-colors">
          <div className="flex flex-col gap-1 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#FFB800]">TEST 08 • Follow-Up Context</span>
              {testResults?.test8 === true && <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle2 size={12}/> PASS</span>}
            </div>
            <p className="text-[10px] text-slate-400">
              "Explain that in simple terms" → Uses previous turn context from session history.
            </p>
          </div>

          <button
            onClick={() => handleTest(8, onRunTest8)}
            disabled={runningTest !== null}
            className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[#FFB800] border border-zinc-800 hover:border-[#FFB800]/50 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {runningTest === 8 ? <RefreshCw size={12} className="animate-spin text-[#FFB800]"/> : <MessageSquare size={12}/>}
            <span>Run Test 08</span>
          </button>
        </div>

        {/* TEST 9: Auto Speech Playback */}
        <div className="glass-card p-3.5 rounded-xl border border-zinc-800 flex flex-col justify-between gap-3 hover:border-[#FFD400]/50 transition-colors">
          <div className="flex flex-col gap-1 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-400">TEST 09 • Auto Playback</span>
              {testResults?.test9 === true && <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle2 size={12}/> PASS</span>}
            </div>
            <p className="text-[10px] text-slate-400">
              Spoken request → Reasoning + Rime TTS → Audio plays automatically without manual play click.
            </p>
          </div>

          <button
            onClick={() => handleTest(9, onRunTest9)}
            disabled={runningTest !== null}
            className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-cyan-400 border border-zinc-800 hover:border-cyan-400/50 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {runningTest === 9 ? <RefreshCw size={12} className="animate-spin text-cyan-400"/> : <Volume2 size={12}/>}
            <span>Run Test 09</span>
          </button>
        </div>

        {/* TEST 10: Conversation Recovery */}
        <div className="glass-card p-3.5 rounded-xl border border-zinc-800 flex flex-col justify-between gap-3 hover:border-[#FFD400]/50 transition-colors">
          <div className="flex flex-col gap-1 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#FFD400]">TEST 10 • Clear & Recovery</span>
              {testResults?.test10 === true && <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle2 size={12}/> PASS</span>}
            </div>
            <p className="text-[10px] text-slate-400">
              Clear session context memory → Ask fresh question → Clean conversational recovery.
            </p>
          </div>

          <button
            onClick={() => handleTest(10, onRunTest10)}
            disabled={runningTest !== null}
            className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[#FFD400] border border-zinc-800 hover:border-[#FFD400]/50 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {runningTest === 10 ? <RefreshCw size={12} className="animate-spin text-[#FFD400]"/> : <RotateCcw size={12}/>}
            <span>Run Test 10</span>
          </button>
        </div>

      </div>
    </div>
  );
}
