import os
from pathlib import Path
from dotenv import load_dotenv

# Search for .env file in root or backend directory
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if not env_path.exists():
    env_path = Path(__file__).resolve().parent.parent / ".env"

load_dotenv(dotenv_path=env_path)

class Settings:
    RIME_API_KEY: str = os.getenv("RIME_API_KEY", "")
    RIME_MODEL: str = os.getenv("RIME_MODEL", "coda")
    RIME_SPEAKER: str = os.getenv("RIME_SPEAKER", "astra")
    RIME_LANG: str = os.getenv("RIME_LANG", "en")
    RIME_ENDPOINT: str = os.getenv("RIME_ENDPOINT", "https://users.rime.ai/v1/rime-tts")
    RIME_AUDIO_FORMAT: str = os.getenv("RIME_AUDIO_FORMAT", "audio/mpeg")
    REASONING_API_KEY: str = os.getenv("REASONING_API_KEY", os.getenv("OPENAI_API_KEY", ""))
    REASONING_MODEL: str = os.getenv("REASONING_MODEL", "gpt-4o-mini")
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")

    @property
    def is_rime_configured(self) -> bool:
        return bool(self.RIME_API_KEY and self.RIME_API_KEY.strip() and self.RIME_API_KEY != "your_rime_api_key_here")

    @property
    def is_reasoning_configured(self) -> bool:
        return bool(self.REASONING_API_KEY and self.REASONING_API_KEY.strip())

settings = Settings()
