from fastapi import APIRouter, Response, HTTPException, status
from fastapi.responses import JSONResponse
from app.models.schemas import TTSRequest
from app.services.rime_service import rime_service
from app.config import settings

router = APIRouter()

@router.post("/tts")
async def generate_speech(request: TTSRequest):
    """
    Synthesizes speech using Rime TTS API.
    Streams audio binary payload to client with X-Rime metadata headers.
    """
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text field cannot be empty.")

    try:
        audio_bytes, media_type = await rime_service.synthesize(
            text=request.text.strip(),
            speaker=request.speaker,
            model_id=request.model_id,
            lang=request.lang
        )

        headers = {
            "Content-Type": media_type,
            "Cache-Control": "no-cache",
            "X-Rime-Speaker": request.speaker or settings.RIME_SPEAKER,
            "X-Rime-Model": request.model_id or settings.RIME_MODEL,
        }
        if request.request_id:
            headers["X-Request-Id"] = request.request_id

        return Response(content=audio_bytes, media_type=media_type, headers=headers)

    except ValueError as val_err:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "error": "RIME_CONFIGURATION_ERROR",
                "message": str(val_err),
                "rime_configured": False,
                "details": rime_service.get_status_info()
            }
        )
    except RuntimeError as run_err:
        return JSONResponse(
            status_code=status.HTTP_502_BAD_GATEWAY,
            content={
                "error": "RIME_API_ERROR",
                "message": str(run_err),
                "rime_configured": settings.is_rime_configured,
                "details": rime_service.get_status_info()
            }
        )
    except Exception as exc:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "INTERNAL_SERVER_ERROR",
                "message": f"Unexpected error during speech synthesis: {str(exc)}",
                "rime_configured": settings.is_rime_configured
            }
        )
