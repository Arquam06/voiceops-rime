from fastapi import APIRouter
from app.services.rime_service import rime_service
from app.models.schemas import HealthResponse

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    return {
        "status": "ok",
        "app_name": "VoiceOps API Engine",
        "version": "1.0.0",
        "rime": rime_service.get_status_info()
    }
