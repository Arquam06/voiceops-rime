import logging
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import TaskStartRequest, TaskResultResponse, InterruptRequest
from app.services.task_service import task_service

logger = logging.getLogger("voiceops.tasks")
router = APIRouter()

# Memory registry for tracking invalidated request IDs
invalidated_requests = set()

@router.post("/start", response_model=TaskResultResponse)
async def start_task(request: TaskStartRequest):
    """
    Executes a simulated operational task with controlled delay.
    Returns structured results and spoken text summary.
    """
    logger.info(f"Starting Task '{request.task_id}' with requestId='{request.request_id}', delay={request.delay_seconds}s")
    
    try:
        result = await task_service.execute_task(
            task_id=request.task_id,
            delay_seconds=request.delay_seconds or 3.0,
            request_id=request.request_id
        )

        # Check if request was invalidated during execution delay
        if request.request_id in invalidated_requests:
            result.is_stale = True
            result.status = "INVALIDATED"
            logger.warning(f"Task '{request.task_id}' (requestId={request.request_id}) finished but was MARKED STALE/INVALIDATED!")

        return result
    except Exception as exc:
        logger.error(f"Error executing task '{request.task_id}': {str(exc)}")
        raise HTTPException(status_code=500, detail=f"Task execution failed: {str(exc)}")

@router.post("/interrupt")
async def interrupt_task(request: InterruptRequest):
    """
    Registers a user interruption event and marks the target active_request_id as invalidated/stale.
    """
    invalidated_requests.add(request.active_request_id)
    logger.info(f"⚡ INTERRUPTION EVENT: Invalidated requestId='{request.active_request_id}' (New Request: '{request.new_request_id}')")
    
    return {
        "status": "interrupted",
        "invalidated_request_id": request.active_request_id,
        "new_request_id": request.new_request_id,
        "message": "Previous task and speech playback marked stale and invalidated."
    }
