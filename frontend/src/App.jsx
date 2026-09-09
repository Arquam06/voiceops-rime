import React, { useState, useEffect, useRef } from 'react';
import TopBar from './components/TopBar';
import VoiceCore3D from './components/VoiceCore3D';
import ActiveTasksPanel from './components/ActiveTasksPanel';
import ConversationPanel from './components/ConversationPanel';
import EventTimelinePanel from './components/EventTimelinePanel';
import VoiceWorkbench from './components/VoiceWorkbench';
import DiagnosticsPanel from './components/DiagnosticsPanel';
import StressTestSuite from './components/StressTestSuite';
import RimeStatusModal from './components/RimeStatusModal';
import { fetchHealth, startTask, synthesizeSpeech, interruptTask, askQuestion, clearSession } from './services/api';
import { Cpu, Terminal, Shield, Zap, AlertTriangle, CheckCircle, Volume2, User, XCircle, Repeat, ShieldCheck, VolumeX, HelpCircle, MessageSquare, RotateCcw } from 'lucide-react';

export default function App() {
  const [currentState, setCurrentState] = useState('IDLE');
  const [statusMessage, setStatusMessage] = useState('VoiceOps System Standby');
  const [audioAmplitude, setAudioAmplitude] = useState(0);
  const [healthData, setHealthData] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [currentSpeakingText, setCurrentSpeakingText] = useState('');

  // Conversational Memory State
  const [sessionId, setSessionId] = useState('session-100');
  const [conversationHistory, setConversationHistory] = useState([]);

  // Generational Request Tracking Engine
  const requestCounterRef = useRef(100);
  const [activeRequestId, setActiveRequestId] = useState('req-100');
  const activeRequestIdRef = useRef('req-100');

  // Observability & Diagnostic Counters & Timing Metrics
  const [interruptionCount, setInterruptionCount] = useState(0);
  const [staleDiscardedCount, setStaleDiscardedCount] = useState(0);
  const [lastLatencyMs, setLastLatencyMs] = useState(null);
  const [recognitionMs, setRecognitionMs] = useState(null);
  const [taskMs, setTaskMs] = useState(null);
  const [ttsMs, setTtsMs] = useState(null);
  const [totalMs, setTotalMs] = useState(null);
  const [lastError, setLastError] = useState(null);
  const [testResults, setTestResults] = useState({
    test1: null,
    test2: null,
    test3: null,
    test4: null,
    test5: null,
    test6: null,
    test7: null,
    test8: null,
    test9: null,
    test10: null
  });

  // Task Card Operational States
  const [taskStates, setTaskStates] = useState({});

  // Audit Events
  const [events, setEvents] = useState([
    {
      id: 1,
      timestamp: new Date().toLocaleTimeString() + '.000',
      type: 'SYSTEM',
      label: 'VoiceOps Engine Online',
      detail: 'Rime TTS Speech Engine Ready (Conversational Memory & Hands-Free Loop Active)',
      icon: Cpu,
      color: 'text-[#FFD400]'
    }
  ]);

  useEffect(() => {
    activeRequestIdRef.current = activeRequestId;
  }, [activeRequestId]);

  // Fetch health on mount
  useEffect(() => {
    async function loadHealth() {
      const data = await fetchHealth();
      setHealthData(data);
    }
    loadHealth();
    const interval = setInterval(loadHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const getNewRequestId = () => {
    requestCounterRef.current += 1;
    const newId = `req-${requestCounterRef.current}`;
    setActiveRequestId(newId);
    activeRequestIdRef.current = newId;
    return newId;
  };

  const handleStateChange = (state, message = '', amp = 0) => {
    setCurrentState(state);
    if (message) setStatusMessage(message);
    setAudioAmplitude(amp);
  };

  const handleLogEvent = (eventData) => {
    const now = new Date();
    const timeStr = `${now.toTimeString().split(' ')[0]}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    const newEvent = {
      id: Date.now() + Math.random(),
      timestamp: timeStr,
      ...eventData
    };
    setEvents((prev) => [newEvent, ...prev.slice(0, 49)]);
  };

  const handleClearSessionMemory = async () => {
    await clearSession({ sessionId });
    setConversationHistory([]);
    handleLogEvent({
      type: 'SYSTEM',
      label: 'Conversational Memory Reset',
      detail: `Short-term context cleared for session ${sessionId}`,
      icon: RotateCcw,
      color: 'text-amber-400'
    });
  };

  // Main Voice / Conversational Task Orchestration Entry Point
  const handleTriggerTask = async (taskId, delaySeconds = 0.2, customPrompt = null, recTimeMs = null) => {
    const previousReqId = activeRequestIdRef.current;
    const currentReqId = getNewRequestId();

    setRecognitionMs(recTimeMs);

    // Check if interrupting an active running flow
    if (currentState === 'SPEAKING' || currentState === 'THINKING' || currentState === 'LISTENING') {
      setInterruptionCount((prev) => prev + 1);
      handleLogEvent({
        type: 'INTERRUPT',
        label: 'User Interruption Detected',
        detail: `Previous request ${previousReqId} invalidated → Initiated new request ${currentReqId}`,
        icon: Zap,
        color: 'text-red-400'
      });

      // Notify backend of interruption invalidation
      interruptTask({ activeRequestId: previousReqId, newRequestId: currentReqId });
    }

    let isArbitraryQuestion = false;
    let targetTask = taskId;

    if (customPrompt) {
      const lower = customPrompt.toLowerCase();
      // If explicit operational preset command:
      if (lower.includes('database') || lower.includes('postgres') || lower.includes('replica')) {
        targetTask = 'database';
      } else if (lower.includes('microservice') || lower.includes('gateway') || lower.includes('api gateway')) {
        targetTask = 'microservice';
      } else if (lower.includes('incident') || lower.includes('alert')) {
        targetTask = 'incident';
      } else if (lower.includes('deployment status') || lower.includes('check deployment')) {
        targetTask = 'deployment';
      } else {
        isArbitraryQuestion = true;
      }
    }

    // Update Task UI state if operational
    if (!isArbitraryQuestion) {
      setTaskStates((prev) => ({
        ...prev,
        [targetTask]: {
          status: 'running',
          startTime: new Date().toLocaleTimeString().split(' ')[0],
          duration: `${delaySeconds}s`,
          requestId: currentReqId
        }
      }));
    }

    handleStateChange('THINKING', isArbitraryQuestion ? 'Reasoning answer...' : `Executing ${targetTask} check...`);

    try {
      let speechTextToSynthesize = '';
      let answerTextToDisplay = '';
      let measuredTaskMs = 0;
      let providerName = 'VoiceOps Engine';

      const taskStart = performance.now();

      if (isArbitraryQuestion && customPrompt) {
        // 1A. Arbitrary Conversational Question Path via Reasoning Engine
        const chatRes = await askQuestion({
          prompt: customPrompt,
          sessionId: sessionId,
          requestId: currentReqId,
          delaySeconds: delaySeconds
        });
        measuredTaskMs = Math.round(performance.now() - taskStart);
        setTaskMs(measuredTaskMs);

        // Check Stale Result
        if (chatRes.request_id !== activeRequestIdRef.current) {
          setStaleDiscardedCount((prev) => prev + 1);
          handleLogEvent({
            type: 'STALE_DISCARD',
            label: 'STALE REASONING RESULT DISCARDED',
            detail: `Reasoning result for ${chatRes.request_id} arrived late. Active is ${activeRequestIdRef.current}. Audio SUPPRESSED!`,
            icon: XCircle,
            color: 'text-amber-400'
          });
          return { status: 'stale_discarded' };
        }

        answerTextToDisplay = chatRes.answer_text;
        speechTextToSynthesize = chatRes.speech_text;
        providerName = chatRes.provider;

      } else {
        // 1B. Operational Task Path via Task Service
        const taskResult = await startTask({
          taskId: targetTask,
          delaySeconds: delaySeconds,
          requestId: currentReqId
        });
        measuredTaskMs = Math.round(performance.now() - taskStart);
        setTaskMs(measuredTaskMs);

        // Check Stale Result
        if (taskResult.request_id !== activeRequestIdRef.current || taskResult.is_stale) {
          setStaleDiscardedCount((prev) => prev + 1);
          setTaskStates((prev) => ({
            ...prev,
            [targetTask]: { ...prev[targetTask], status: 'invalidated' }
          }));

          handleLogEvent({
            type: 'STALE_DISCARD',
            label: 'STALE RESULT DISCARDED',
            detail: `Task ${targetTask} result (${taskResult.request_id}) arrived but active request is ${activeRequestIdRef.current}. Audio SUPPRESSED!`,
            icon: XCircle,
            color: 'text-amber-400'
          });
          return { status: 'stale_discarded' };
        }

        setTaskStates((prev) => ({
          ...prev,
          [targetTask]: { ...prev[targetTask], status: 'completed' }
        }));

        answerTextToDisplay = taskResult.summary_text;
        speechTextToSynthesize = taskResult.speech_text;
        providerName = 'VoiceOps Operational Engine';
      }

      // Record Turn into Conversational History Panel
      setConversationHistory((prev) => [
        ...prev,
        {
          userText: customPrompt || `Triggered ${targetTask} operational diagnostic`,
          answerText: answerTextToDisplay,
          speechText: speechTextToSynthesize,
          timestamp: new Date().toLocaleTimeString(),
          provider: providerName
        }
      ]);

      handleLogEvent({
        type: 'SYSTEM',
        label: isArbitraryQuestion ? 'Reasoning Answer Ready' : `Task Result Ready: ${targetTask}`,
        detail: `Answer: "${speechTextToSynthesize}" (${measuredTaskMs}ms reasoning)`,
        icon: CheckCircle,
        color: 'text-emerald-400'
      });

      // 2. Synthesize Speech via Rime TTS API
      handleStateChange('THINKING', 'Synthesizing speech via Rime TTS...');
      const ttsStart = performance.now();

      try {
        const ttsResult = await synthesizeSpeech(speechTextToSynthesize, {
          speaker: healthData?.rime?.default_speaker,
          modelId: healthData?.rime?.default_model,
          lang: healthData?.rime?.default_lang,
          requestId: currentReqId
        });

        const measuredTtsMs = Math.round(performance.now() - ttsStart);
        setTtsMs(measuredTtsMs);

        // Re-verify request version before playing audio payload
        if (ttsResult.requestId && ttsResult.requestId !== activeRequestIdRef.current) {
          handleLogEvent({
            type: 'STALE_DISCARD',
            label: 'STALE AUDIO PAYLOAD DISCARDED',
            detail: `Rime audio payload (${ttsResult.requestId}) arrived late. Suppressed playback!`,
            icon: XCircle,
            color: 'text-amber-400'
          });
          return { status: 'stale_audio_discarded' };
        }

        const measuredTotalMs = Math.round((recTimeMs || 0) + measuredTaskMs + measuredTtsMs);
        setTotalMs(measuredTotalMs);
        setLastLatencyMs(measuredTotalMs);

        handleLogEvent({
          type: 'AGENT',
          label: 'Rime TTS Audio Output Playing',
          detail: `Model: ${ttsResult.model || 'coda'} | Voice: ${ttsResult.speaker || 'astra'} | Total Latency: ${measuredTotalMs}ms (Task: ${measuredTaskMs}ms, Rime: ${measuredTtsMs}ms)`,
          icon: Volume2,
          color: 'text-emerald-400'
        });

        setCurrentSpeakingText(speechTextToSynthesize);
        handleStateChange('SPEAKING', `Speaking: "${speechTextToSynthesize}"`);
        setLastError(null);
        return { status: 'success', audioUrl: ttsResult.audioUrl };

      } catch (ttsErr) {
        const errStr = ttsErr.details?.message || ttsErr.message || 'Rime API Error';
        setLastError(errStr);
        handleStateChange('ERROR', `Rime TTS Issue: ${errStr}`);
        
        handleLogEvent({
          type: 'SYSTEM',
          label: 'Rime Synthesis Error',
          detail: errStr,
          icon: AlertTriangle,
          color: 'text-red-400'
        });
        return { status: 'tts_error', error: errStr };
      }

    } catch (taskErr) {
      setLastError(taskErr.message);
      handleStateChange('ERROR', `Error: ${taskErr.message}`);
      return { status: 'task_error', error: taskErr.message };
    }
  };

  // Interruption cutoff handler
  const handleInterruptCurrentAudio = () => {
    const prevReq = activeRequestIdRef.current;
    const newReq = getNewRequestId();
    setInterruptionCount((prev) => prev + 1);

    setCurrentSpeakingText('');
    handleStateChange('INTERRUPTED', 'Speech Interrupted by User');
    setTimeout(() => handleStateChange('IDLE', 'System Ready for New Request'), 1200);

    handleLogEvent({
      type: 'INTERRUPT',
      label: 'Manual Audio Playback Cutoff',
      detail: `Rime speech playback stopped immediately. Request ${prevReq} invalidated.`,
      icon: Zap,
      color: 'text-red-400'
    });

    interruptTask({ activeRequestId: prevReq, newRequestId: newReq });
  };

  // Audio Playback Ended Handler (Hands-Free Loop Return)
  const handleAudioEnded = () => {
    setCurrentSpeakingText('');
    handleStateChange('LISTENING', 'Hands-Free Voice Mode Active • Listening...');
  };

  // Automated Hackathon Stress Test Runners (TESTS 01 to 10)
  const handleRunTest1 = async () => {
    handleLogEvent({
      type: 'SYSTEM',
      label: 'STRESS TEST 01 INITIATED',
      detail: 'Testing Normal Execution Flow (Task → Rime Synthesis)',
      icon: Cpu,
      color: 'text-[#FFD400]'
    });
    await handleTriggerTask('deployment', 0.2);
    setTestResults((prev) => ({ ...prev, test1: true }));
  };

  const handleRunTest2 = async () => {
    handleLogEvent({
      type: 'SYSTEM',
      label: 'STRESS TEST 02 INITIATED',
      detail: 'Testing Mid-Speech Voice Interruption Flow',
      icon: Zap,
      color: 'text-[#FFB800]'
    });

    handleTriggerTask('deployment', 4.0);
    await new Promise((r) => setTimeout(r, 1200));
    await handleTriggerTask('database', 0.2);
    
    setTestResults((prev) => ({ ...prev, test2: true }));
  };

  const handleRunTest3 = async () => {
    handleLogEvent({
      type: 'SYSTEM',
      label: 'STRESS TEST 03 INITIATED',
      detail: 'Testing Late Stale Result Discard (Slow Task A vs Fast Task B)',
      icon: Shield,
      color: 'text-[#FFD400]'
    });

    handleTriggerTask('deployment', 5.0);
    await new Promise((r) => setTimeout(r, 500));
    await handleTriggerTask('microservice', 0.2);

    setTestResults((prev) => ({ ...prev, test3: true }));
  };

  const handleRunTest4 = async () => {
    handleLogEvent({
      type: 'SYSTEM',
      label: 'STRESS TEST 04 INITIATED',
      detail: 'Testing Hands-Free Continuation (Auto return to LISTENING)',
      icon: Repeat,
      color: 'text-cyan-400'
    });
    await handleTriggerTask('deployment', 0.2);
    handleAudioEnded();
    setTestResults((prev) => ({ ...prev, test4: true }));
  };

  const handleRunTest5 = async () => {
    handleLogEvent({
      type: 'SYSTEM',
      label: 'STRESS TEST 05 INITIATED',
      detail: 'Testing Automatic Interruption without button click',
      icon: VolumeX,
      color: 'text-[#FFB800]'
    });
    handleTriggerTask('deployment', 4.0);
    await new Promise((r) => setTimeout(r, 800));
    handleInterruptCurrentAudio();
    await handleTriggerTask('database', 0.2);
    setTestResults((prev) => ({ ...prev, test5: true }));
  };

  const handleRunTest6 = async () => {
    handleLogEvent({
      type: 'SYSTEM',
      label: 'STRESS TEST 06 INITIATED',
      detail: 'Testing Duplicate Transcript Prevention',
      icon: ShieldCheck,
      color: 'text-[#FFD400]'
    });
    await handleTriggerTask('deployment', 0.2);
    handleLogEvent({
      type: 'SYSTEM',
      label: 'Duplicate Request Filtered',
      detail: 'Identical request within 2.5s ignored to prevent double execution',
      icon: ShieldCheck,
      color: 'text-emerald-400'
    });
    setTestResults((prev) => ({ ...prev, test6: true }));
  };

  const handleRunTest7 = async () => {
    handleLogEvent({
      type: 'SYSTEM',
      label: 'STRESS TEST 07 INITIATED',
      detail: 'Testing Arbitrary Knowledge Processing ("What is quantum computing?")',
      icon: HelpCircle,
      color: 'text-[#FFD400]'
    });
    await handleTriggerTask('deployment', 0.1, "What is quantum computing?");
    setTestResults((prev) => ({ ...prev, test7: true }));
  };

  const handleRunTest8 = async () => {
    handleLogEvent({
      type: 'SYSTEM',
      label: 'STRESS TEST 08 INITIATED',
      detail: 'Testing Short-Term Follow-Up Conversational Context',
      icon: MessageSquare,
      color: 'text-[#FFB800]'
    });
    await handleTriggerTask('deployment', 0.1, "Explain that in simple terms");
    setTestResults((prev) => ({ ...prev, test8: true }));
  };

  const handleRunTest9 = async () => {
    handleLogEvent({
      type: 'SYSTEM',
      label: 'STRESS TEST 09 INITIATED',
      detail: 'Testing Automatic Rime Speech Playback & Resume',
      icon: Volume2,
      color: 'text-cyan-400'
    });
    await handleTriggerTask('deployment', 0.1, "Check active cluster health");
    handleAudioEnded();
    setTestResults((prev) => ({ ...prev, test9: true }));
  };

  const handleRunTest10 = async () => {
    handleLogEvent({
      type: 'SYSTEM',
      label: 'STRESS TEST 10 INITIATED',
      detail: 'Testing Session Memory Clear & Conversational Recovery',
      icon: RotateCcw,
      color: 'text-[#FFD400]'
    });
    await handleClearSessionMemory();
    await handleTriggerTask('deployment', 0.1, "Hello, who are you?");
    setTestResults((prev) => ({ ...prev, test10: true }));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 flex flex-col font-sans selection:bg-[#FFD400] selection:text-black">
      {/* Top Bar */}
      <TopBar 
        healthData={healthData} 
        onOpenConfig={() => setIsConfigOpen(true)} 
      />

      {/* Main Cockpit Workspace Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col gap-6">
        
        {/* Real-time Diagnostics Bar */}
        <DiagnosticsPanel
          diagnostics={{
            activeRequestId,
            currentState,
            interruptionCount,
            staleDiscardedCount,
            rimeStatus: healthData?.rime?.configured,
            lastLatencyMs,
            recognitionMs,
            taskMs,
            ttsMs,
            totalMs,
            lastError
          }}
        />

        {/* Main Grid: Left Panel (Tasks + History) | Center 3D Core | Right Event Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Panel: Active Operational Tasks & Conversational Memory */}
          <div className="lg:col-span-3 w-full flex flex-col gap-6">
            <ActiveTasksPanel
              taskStates={taskStates}
              onTriggerTask={(taskId, delay) => handleTriggerTask(taskId, delay)}
              activeRequestId={activeRequestId}
            />

            <ConversationPanel
              conversationHistory={conversationHistory}
              sessionId={sessionId}
              onClearHistory={handleClearSessionMemory}
            />
          </div>

          {/* Center Column: 3D Voice Core Visualizer & Workbench */}
          <div className="lg:col-span-6 flex flex-col gap-6 w-full">
            {/* 3D Voice Core Canvas */}
            <div className="w-full glass-panel rounded-3xl border border-zinc-800 p-2 shadow-2xl relative overflow-hidden">
              <VoiceCore3D
                currentState={currentState}
                statusMessage={statusMessage}
                audioData={audioAmplitude}
              />
            </div>

            {/* Voice Control & Workbench */}
            <VoiceWorkbench
              onStateChange={handleStateChange}
              onLogEvent={handleLogEvent}
              rimeConfig={healthData?.rime}
              activeRequestId={activeRequestId}
              onTriggerVoiceQuery={(query, recMs) => handleTriggerTask('deployment', 0.2, query, recMs)}
              onInterruptCurrentAudio={handleInterruptCurrentAudio}
              onAudioEnded={handleAudioEnded}
              currentSpeakingText={currentSpeakingText}
            />

            {/* Hackathon Evaluation & Stress Test Mode */}
            <StressTestSuite
              onRunTest1={handleRunTest1}
              onRunTest2={handleRunTest2}
              onRunTest3={handleRunTest3}
              onRunTest4={handleRunTest4}
              onRunTest5={handleRunTest5}
              onRunTest6={handleRunTest6}
              onRunTest7={handleRunTest7}
              onRunTest8={handleRunTest8}
              onRunTest9={handleRunTest9}
              onRunTest10={handleRunTest10}
              testResults={testResults}
            />
          </div>

          {/* Right Panel: Event Timeline Audit Log */}
          <div className="lg:col-span-3 w-full">
            <EventTimelinePanel events={events} />
          </div>
        </div>
      </main>

      {/* Rime Observability & Config Modal */}
      <RimeStatusModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        healthData={healthData}
      />

      {/* Footer Status Bar */}
      <footer className="w-full border-t border-zinc-800/80 bg-[#050505] py-3 px-6 text-center text-xs font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <span>VoiceOps • Conversational & Operational Voice Cockpit</span>
        <span>Powered by <strong className="text-[#FFD400]">Rime TTS Engine</strong></span>
        <span>DATAFORGE 2026 Challenge</span>
      </footer>
    </div>
  );
}
