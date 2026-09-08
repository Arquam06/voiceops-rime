# VoiceOps — Voice-Native Operational Control Cockpit

**Built for the DATAFORGE 2026 — RIME HACKATHON CHALLENGE ("Build a voice-native product")**

[![Rime Speech Native](https://img.shields.io/badge/Speech%20Engine-Rime%20TTS-FFD400)](https://rime.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-FFB800.svg)](LICENSE)

---

## What is VoiceOps?

**VoiceOps** is an interactive, real-time, voice-native operational control environment for cloud infrastructure, Kubernetes deployments, PostgreSQL replica health, microservice latency, and incident response.

Unlike conventional dashboards or text chatbots, VoiceOps is genuinely hands-free:
- **Single-Click Activation**: Clicking the microphone once enters continuous hands-free voice mode.
- **Hands-Free Conversation**: Spoken commands automatically execute operational queries, synthesize expressive audio via **Rime TTS**, play audio output, and automatically return to listening without requiring repeated button clicks.
- **Automatic Voice Interruption (Barge-In)**: Users can speak mid-sentence while Rime is speaking to instantly stop playback, invalidate the active request ID, and start executing the new operational query.
- **Echo Suppression & Deduplication**: Smart application-state filtering prevents the system from mistaking Rime's speaker output for user input, while deduplicating identical transcripts within 2.5 seconds.
- **Stale Result Discard**: Long-running background task results arriving after an interruption are reconciled via generational `requestId` tokens and discarded without being spoken.

---

## The Problem & The Hard Voice Challenge

During critical incident triage:
1. **Context Switching Latency**: Navigating multiple SaaS dashboards or terminal commands during outages delays resolution.
2. **Text Chatbot Limitations**: Staring at screens and typing queries breaks flow during war rooms.
3. **The Hard Voice Problem (Interruption + Recovery + Stale Result Suppression)**: Legacy voice agents speak outdated results when interrupted mid-flight. If a 5-second database query finishes AFTER the user has already requested a new command, legacy systems speak the obsolete response — creating dangerous operational state leakage.

### Falsifiable Engineering Claim:
> *"A voice agent can maintain a consistent current task state during user interruption if speech playback and long-running task results are explicitly versioned with generational request tokens (`requestId`) and reconciled before audio synthesis."*

---

## System Architecture & State Machine

```
┌────────────────────────────────────────────────────────┐
│             VoiceOps Cockpit UI (React + WebGL)        │
│  - 3D Voice Core (Three.js real-time state reactor)   │
│  - Web Speech Input / Hands-Free Controller           │
│  - Active Operations Panel (Task Cards & Timers)      │
│  - Real-Time Event & Audit Timeline                   │
│  - Real-Time Audio Spectrum Visualizer                │
│  - Hackathon Evaluation Suite (Tests 01 - 06)         │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP REST Requests
                            ▼
┌────────────────────────────────────────────────────────┐
│                FastAPI Operations Engine                │
│  - /api/health     : Reports system & Rime status     │
│  - /api/tts        : Proxies Rime TTS synthesis      │
│  - /api/task/start : Executes async tasks with delay   │
│  - /api/task/interrupt: Registers invalidations        │
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
| **API Endpoint** | `https://users.rime.ai/v1/rime-tts` | Official Rime HTTP v1 endpoint |
| **Model ID** | `coda` (or `mistv3` for low-latency) | Rime flagship conversational speech model |
| **Speaker Voice** | `astra` (or `luna`, `marcus`, `zeus`) | Primary operational agent voice identity |
| **Language** | `en` | English speech synthesis |
| **Audio Format** | `audio/mpeg` (MP3 binary stream) | High-fidelity compressed audio payload |
| **Authentication** | `Authorization: Bearer RIME_API_KEY` | Server-side bearer token authorization |

*Security Note: `RIME_API_KEY` is loaded strictly on the backend `.env` and NEVER exposed to client JavaScript.*

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
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
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

## Evaluation & Stress Test Suite (6 Scenarios)

The UI includes a deterministic Hackathon Evaluation panel for judges to verify hard voice mechanics:

1. **TEST 01 — Normal Flow**: User request → Task completes → Rime synthesizes speech → Spoken output.
2. **TEST 02 — Voice Interruption**: Starts Task A → Interrupted mid-speech → Audio cuts off immediately → Task B speaks.
3. **TEST 03 — Late Stale Result Discard**: Slow Task A (5.0s) vs Fast Task B (1.5s) → Task B speaks → Task A arrives late & discarded (`requestId` mismatch)!
4. **TEST 04 — Hands-Free Continuation**: Task 1 completes → Rime finishes → System automatically re-enters `LISTENING` state without clicking.
5. **TEST 05 — Automatic Interruption**: Rime speaking → User speaks → Audio cutoff automatically without manual button click.
6. **TEST 06 — Duplicate Prevention**: Submit identical command within 2.5s → Duplicate ignored, single execution guaranteed.

---

## License & Third-Party Disclosure

- **Source Code**: MIT License.
- **Speech Engine**: Powered by [Rime AI](https://rime.ai).
- **Libraries**: React, Vite, FastAPI, Three.js, Lucide Icons, Tailwind CSS, Uvicorn, HTTPX.
- **AI Assistance Disclosure**: Built with assistance from Google Antigravity AI pair programming tools.
