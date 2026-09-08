import logging
import httpx
from typing import Tuple, Dict, Any
from app.config import settings

logger = logging.getLogger("voiceops.rime")

class RimeService:
    def __init__(self):
        self.endpoint = settings.RIME_ENDPOINT
        self.api_key = settings.RIME_API_KEY
        self.default_model = settings.RIME_MODEL
        self.default_speaker = settings.RIME_SPEAKER
        self.default_lang = settings.RIME_LANG
        self.audio_format = settings.RIME_AUDIO_FORMAT

    def get_status_info(self) -> Dict[str, Any]:
        return {
            "configured": settings.is_rime_configured,
            "endpoint": self.endpoint,
            "default_model": self.default_model,
            "default_speaker": self.default_speaker,
            "default_lang": self.default_lang,
            "audio_format": self.audio_format,
            "api_key_set": bool(self.api_key and len(self.api_key) > 5)
        }

    async def synthesize(self, text: str, speaker: str = None, model_id: str = None, lang: str = None) -> Tuple[bytes, str]:
        """
        Calls Rime TTS API to synthesize speech using the official Coda API contract.
        Returns (audio_bytes, media_type).
        """
        if not settings.is_rime_configured:
            raise ValueError(
                "RIME_API_KEY is missing or invalid in environment. "
                "Please configure RIME_API_KEY in your .env file to enable live Rime speech synthesis."
            )

        active_speaker = speaker or self.default_speaker
        active_model = model_id or self.default_model
        active_lang = lang or self.default_lang

        headers = {
            "Authorization": f"Bearer {self.api_key.strip()}",
            "Content-Type": "application/json",
            "Accept": self.audio_format
        }

        # Official Rime Coda API Payload Contract
        payload = {
            "speaker": active_speaker,
            "text": text,
            "modelId": active_model,
            "language": active_lang
        }

        logger.info(f"Posting Rime TTS request to '{self.endpoint}' [model={active_model}, speaker={active_speaker}, lang={active_lang}]")

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.post(self.endpoint, json=payload, headers=headers)
                
                if response.status_code != 200:
                    error_body = response.text[:500]
                    logger.error(f"❌ Rime API Error HTTP {response.status_code}: {error_body}")
                    raise RuntimeError(
                        f"Rime API returned HTTP {response.status_code}: {error_body}"
                    )

                media_type = response.headers.get("content-type", self.audio_format)
                logger.info(f"✅ Rime TTS Synthesis Successful: Received {len(response.content)} bytes ({media_type})")
                return response.content, media_type

            except httpx.RequestError as exc:
                logger.error(f"❌ Network connection error to Rime endpoint '{self.endpoint}': {str(exc)}")
                raise RuntimeError(f"Network error connecting to Rime API endpoint ({self.endpoint}): {str(exc)}")

rime_service = RimeService()
