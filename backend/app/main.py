import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import health, tts, tasks
from app.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("voiceops")

app = FastAPI(
    title="VoiceOps Operations Engine API",
    description="Voice-Native Control Cockpit API for DATAFORGE 2026 Rime Challenge",
    version="1.0.0"
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Type", "X-Rime-Speaker", "X-Rime-Model", "X-Request-Id"],
)

# Include routers
app.include_router(health.router, prefix="/api", tags=["System"])
app.include_router(tts.router, prefix="/api", tags=["Speech"])
app.include_router(tasks.router, prefix="/api/task", tags=["Tasks"])

@app.on_event("startup")
async def startup_event():
    logger.info("==================================================")
    logger.info("VoiceOps Backend Services Starting...")
    logger.info(f"Target Rime Endpoint: {settings.RIME_ENDPOINT}")
    logger.info(f"Default Model: {settings.RIME_MODEL}")
    logger.info(f"Default Speaker: {settings.RIME_SPEAKER}")
    logger.info(f"Rime API Key Configured: {settings.is_rime_configured}")
    if not settings.is_rime_configured:
        logger.warning(
            "⚠️ RIME_API_KEY is not set or using placeholder! "
            "Live speech synthesis requests will return status 400 until RIME_API_KEY is provided in .env."
        )
    logger.info("==================================================")
