/**
 * VoiceOps Frontend API Service
 */

export async function fetchHealth() {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Health check failed:", error);
    return {
      status: "error",
      app_name: "VoiceOps API",
      version: "1.0.0",
      rime: { configured: false, error: error.message }
    };
  }
}

export async function synthesizeSpeech(text, options = {}) {
  const { speaker, modelId, lang, requestId } = options;
  
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      speaker: speaker || undefined,
      modelId: modelId || undefined,
      lang: lang || undefined,
      request_id: requestId || undefined,
    })
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
    }
    const err = new Error(errorData.message || 'Speech synthesis failed');
    err.status = response.status;
    err.details = errorData;
    throw err;
  }

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const speakerHeader = response.headers.get('X-Rime-Speaker');
  const modelHeader = response.headers.get('X-Rime-Model');
  const requestIdHeader = response.headers.get('X-Request-Id');

  return {
    audioBlob,
    audioUrl,
    speaker: speakerHeader,
    model: modelHeader,
    requestId: requestIdHeader,
  };
}

export async function startTask({ taskId, delaySeconds = 3.0, requestId }) {
  const response = await fetch('/api/task/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      task_id: taskId,
      delay_seconds: delaySeconds,
      request_id: requestId
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Task execution failed');
  }

  return await response.json();
}

export async function interruptTask({ activeRequestId, newRequestId, reason }) {
  try {
    const response = await fetch('/api/task/interrupt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        active_request_id: activeRequestId,
        new_request_id: newRequestId || undefined,
        reason: reason || 'User voice interruption'
      })
    });
    return await response.json();
  } catch (err) {
    console.warn("Interrupt notification error:", err);
  }
}
