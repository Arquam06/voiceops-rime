from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any

class TTSRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    text: str = Field(..., description="Text content to synthesize into speech using Rime")
    speaker: Optional[str] = Field(default=None, description="Rime speaker voice ID (e.g. 'astra', 'luna')")
    model_id: Optional[str] = Field(default=None, alias="modelId", description="Rime model ID (e.g. 'coda', 'mistv3')")
    lang: Optional[str] = Field(default=None, description="Language code (e.g. 'en')")
    request_id: Optional[str] = Field(default=None, description="Client tracking request ID for state reconciliation")

class TaskStartRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    task_id: str = Field(..., description="Target operational task ID (e.g. 'deployment', 'database', 'microservice', 'incident')")
    delay_seconds: Optional[float] = Field(default=3.0, description="Simulated operational execution delay in seconds")
    request_id: str = Field(..., description="Generational request ID token for stale task reconciliation")
    parameters: Optional[Dict[str, Any]] = Field(default=None, description="Optional task parameters")

class TaskResultResponse(BaseModel):
    task_id: str
    request_id: str
    status: str  # completed, invalidated, error
    summary_text: str
    speech_text: str
    execution_time_ms: float
    is_stale: bool = False
    details: Dict[str, Any]

class InterruptRequest(BaseModel):
    active_request_id: str = Field(..., description="The request ID being cancelled or invalidated")
    new_request_id: Optional[str] = Field(default=None, description="The newly initiated request ID")
    reason: Optional[str] = Field(default="User voice interruption", description="Reason for interruption")

class HealthResponse(BaseModel):
    status: str
    app_name: str
    version: str
    rime: Dict[str, Any]

class TTSErrorResponse(BaseModel):
    error: str
    message: str
    rime_configured: bool
    details: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    prompt: str = Field(..., description="User voice or text prompt/question")
    session_id: Optional[str] = Field(default="session-default", alias="sessionId", description="Conversational session context ID")
    request_id: Optional[str] = Field(default=None, alias="requestId", description="Tracking request ID token")
    delay_seconds: Optional[float] = Field(default=0.0, description="Optional delay for test simulation")

class ChatResponse(BaseModel):
    answer_text: str = Field(..., description="Full text answer to display in conversation panel")
    speech_text: str = Field(..., description="Concise TTS-optimized spoken text for Rime audio synthesis")
    session_id: str
    request_id: str
    reasoning_time_ms: float
    provider: str = Field(default="voiceops-engine", description="Name of reasoning provider used")
    history_length: int = Field(default=0, description="Number of conversation turns stored in session context")

class ClearSessionRequest(BaseModel):
    session_id: str = Field(..., alias="sessionId", description="Session ID to clear history for")

class ClearSessionResponse(BaseModel):
    status: str
    session_id: str
    message: str

