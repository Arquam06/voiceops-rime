# VoiceOps — Conversational & Operational Voice Cockpit

**Built for the DATAFORGE 2026 — RIME HACKATHON CHALLENGE ("Build a voice-native product")**

[![Rime Speech Native](https://img.shields.io/badge/Speech%20Engine-Rime%20TTS-FFD400)](https://rime.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-FFB800.svg)](LICENSE)

---

## What is VoiceOps?

**VoiceOps** is an interactive, real-time, voice-native conversational control cockpit powering long-running operational tasks and arbitrary conversational reasoning using **Rime Text-to-Speech**.

Unlike conventional dashboards or text chatbots, VoiceOps is genuinely hands-free and conversational:
- **Arbitrary Conversational Questions**: Ask any question naturally ("What is quantum computing?", "Explain DBMS normalization", "Why does a linked list need pointers?") without being restricted to preset commands.
- **Short-Term Conversational Memory**: Maintains session context per `session_id` to handle follow-up queries ("Explain that in simpler terms", "Give an example", "Why is that?").
- **Single-Click Activation**: Clicking the microphone once enters continuous hands-free voice mode.
- **Hands-Free Loop**: Spoken queries automatically execute reasoning/task queries, format speech text for natural delivery, synthesize audio via **Rime TTS API**, stream audio playback, and automatically return to listening without needing repeated microphone clicks.
- **Automatic Voice Interruption (Barge-In)**: Users can speak mid-sentence while Rime is speaking to instantly cut off audio playback, invalidate the active request ID, and start executing the new query.
- **Echo Suppression & Deduplication**: Smart application-state filtering prevents the system from mistaking Rime's speaker output for user input, while deduplicating identical transcripts within 2.5 seconds.
- **Stale Result Discard**: Long-running background task or reasoning results arriving after an interruption are reconciled via generational `requestId` tokens and discarded without being spoken.

---

## The Problem & The Hard Voice Challenge

During critical operations and interactive voice sessions:
1. **Context Switching Latency**: Navigating multiple SaaS dashboards or terminal commands delays resolution.
2. **Text Chatbot Limitations**: Staring at screens and typing queries breaks flow during live war rooms.
3. **The Hard Voice Problem (Interruption + Recovery + Stale Result Suppression)**: Legacy voice agents speak outdated results when interrupted mid-flight. If a slow task finishes AFTER the user has already requested a new command, legacy systems speak the obsolete response — creating dangerous operational state leakage.

### Falsifiable Engineering Claim:
> *"A voice agent can maintain a consistent current conversation state during user interruption if speech playback and background reasoning results are explicitly versioned with generational request tokens (`requestId`) and reconciled before audio synthesis."*

---

## System Architecture & State Machine

```
┌────────────────────────────────────────────────────────┐
│             VoiceOps Cockpit UI (React + WebGL)        │
│  - 3D Voice Core (Three.js real-time state reactor)   │
│  - Web Speech Input / Hands-Free Controller           │
│  - Active Operations Panel (Task Cards & Timers)      │
│  - Conversational Memory History Panel                │
│  - Real-Time Event & Audit Timeline                   │
│  - Real-Time Audio Spectrum Visualizer                │
│  - Hackathon Evaluation Suite (Tests 01 - 10)         │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP REST Requests (/api/*)
                            ▼
┌────────────────────────────────────────────────────────┐
│                FastAPI Operations Engine                │
│  - /api/health     : Reports system & Rime status     │
│  - /api/tts        : Proxies Rime TTS synthesis      │
│  - /api/task/start : Executes async tasks with delay   │
│  - /api/task/interrupt: Registers invalidations        │
│  - /api/chat/ask   : Reasoning & session memory      │
│  - /api/chat/clear : Clears short-term context        │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS (Bearer RIME_API_KEY)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Rime Speech API                      │
│            https://users.rime.ai/v1/rime-tts          │
└────────────────────────────────────────────────────────┘
```

### Application State Machine:
`IDLE` → `LISTENING` → `THINKING` → `SPEAKING` → `INTERRUPTED` → `RECOVERING` → `LISTENING` (Auto Loop)

---

## Rime TTS Integration Details

VoiceOps utilizes Rime as its primary voice synthesis engine.

| Parameter | Configured Production Value | Description |
| :--- | :--- | :--- |
| **Provider** | Rime TTS | Primary spoken output engine |
| **API Endpoint** | `https://users.rime.ai/v1/rime-tts` | Official Rime HTTP v1 Coda endpoint |
| **Model ID** | `coda` (or `mistv3` for low-latency) | Rime flagship conversational speech model |
| **Speaker Voice** | `astra` (or `luna`, `marcus`, `zeus`) | Primary operational agent voice identity |
| **Language** | `en` | English speech synthesis |
| **Audio Format** | `audio/mpeg` (MP3 binary stream) | High-fidelity compressed audio payload |
| **Authentication** | `Authorization: Bearer RIME_API_KEY` | Server-side bearer token authorization |

*Security Note: `RIME_API_KEY` is loaded strictly in the backend environment and NEVER exposed to client JavaScript.*

---

## Quick Start & Running Locally

### 1. Environment Setup
Copy the environment template and set your Rime credentials in `backend/.env`:
```bash
cp .env.example .env
```
Edit `.env`:
```ini
RIME_API_KEY=your_actual_rime_api_key_here
RIME_MODEL=coda
RIME_SPEAKER=astra
# Optional external LLM key for custom reasoning:
# REASONING_API_KEY=your_openai_or_custom_llm_key
```

### 2. Start Backend (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Verify backend health: `http://127.0.0.1:8000/api/health`

### 3. Start Frontend (React + Vite)
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open your browser to: `http://localhost:5173`

---

## Evaluation & Stress Test Suite (10 Scenarios)

The UI includes a deterministic Hackathon Evaluation panel for judges to verify hard voice mechanics:

1. **TEST 01 — Normal Flow**: User request → Task completes → Rime synthesizes speech → Spoken output.
2. **TEST 02 — Voice Interruption**: Starts Task A → Interrupted mid-speech → Audio cuts off immediately → Task B speaks.
3. **TEST 03 — Late Stale Result Discard**: Slow Task A (5.0s) vs Fast Task B (1.5s) → Task B speaks → Task A arrives late & discarded (`requestId` mismatch)!
4. **TEST 04 — Hands-Free Continuation**: Task 1 completes → Rime finishes → System automatically re-enters `LISTENING` state without clicking.
5. **TEST 05 — Automatic Interruption**: Rime speaking → User speaks → Audio cutoff automatically without manual button click.
6. **TEST 06 — Duplicate Prevention**: Submit identical command within 2.5s → Duplicate ignored, single execution guaranteed.
7. **TEST 07 — Arbitrary Question**: Ask "What is quantum computing?" → Reasoning service generates response → Rime speaks.
8. **TEST 08 — Follow-Up Context**: Ask "Explain that in simple terms" → Uses previous turn context from session history.
9. **TEST 09 — Auto Speech Playback**: Audio synthesizes and streams playback automatically upon response arrival.
10. **TEST 10 — Memory Clear & Recovery**: Clear session context memory → Ask fresh question → Clean conversational recovery.

---

## License & Third-Party Disclosure

- **Source Code**: MIT License.
- **Speech Engine**: Powered by [Rime AI](https://rime.ai).
- **Libraries**: React, Vite, FastAPI, Three.js, Lucide Icons, Tailwind CSS, Uvicorn, HTTPX.
- **AI Assistance Disclosure**: Built with assistance from Google Antigravity AI pair programming tools.
