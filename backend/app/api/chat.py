import logging
from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse, ClearSessionRequest, ClearSessionResponse
from app.services.reasoning_service import reasoning_service, session_store

logger = logging.getLogger("voiceops.api.chat")
router = APIRouter()

@router.post("/ask", response_model=ChatResponse)
async def ask_question(request: ChatRequest):
    """
    Process arbitrary user voice or text prompts, maintain short-term session context,
    and return answer text and Rime TTS-optimized speech text.
    """
    try:
        req_id = request.request_id or f"req-{int(logger.name.__hash__() % 10000)}"
        sess_id = request.session_id or "session-default"
        
        result = await reasoning_service.process_chat(
            prompt=request.prompt,
            session_id=sess_id,
            request_id=req_id,
            delay_seconds=request.delay_seconds or 0.0
        )
        return ChatResponse(**result)
    except Exception as e:
        logger.error(f"Error processing chat prompt: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clear", response_model=ClearSessionResponse)
async def clear_session(request: ClearSessionRequest):
    """
    Clear stored short-term conversational context history for a given session ID.
    """
    try:
        session_store.clear_session(request.session_id)
        return ClearSessionResponse(
            status="success",
            session_id=request.session_id,
            message=f"Conversational memory for session {request.session_id} cleared."
        )
    except Exception as e:
        logger.error(f"Error clearing session {request.session_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
