"""
ORACLE Trading Agent - Central Configuration & Environment Settings
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env first, fallback to .env.example if .env does not exist
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / ".env"
if not env_path.exists():
    env_path = BASE_DIR / ".env.example"

load_dotenv(env_path)

class Settings:
    # AIML API (Official LangChain Partner Integration)
    AIML_API_KEY: str = (os.getenv("AIMLAPI_API_KEY") or os.getenv("AIML_API_KEY", "")).strip('\"\'')
    AIML_BASE_URL: str = os.getenv("AIML_BASE_URL", "https://api.aimlapi.com/v1")
    AI_MODEL: str = os.getenv("AI_MODEL", "claude-3-5-sonnet-20240620")

    # Alpaca Paper Trading API
    APCA_API_KEY_ID: str = os.getenv("APCA_API_KEY_ID", "").strip('\"\'')
    APCA_API_SECRET_KEY: str = os.getenv("APCA_API_SECRET_KEY", "").strip('\"\'')
    APCA_API_BASE_URL: str = os.getenv("APCA_API_BASE_URL", "https://paper-api.alpaca.markets")

    # Risk Parameters
    INITIAL_BALANCE: float = float(os.getenv("INITIAL_BALANCE", 100000.0))
    MAX_LOSS_PER_TRADE: float = float(os.getenv("MAX_LOSS_PER_TRADE", 150.0))
    DAILY_LOSS_LIMIT: float = float(os.getenv("DAILY_LOSS_LIMIT", 500.0))
    PROFIT_TARGET_PERCENT: float = float(os.getenv("PROFIT_TARGET_PERCENT", 50.0))
    ACCOUNT_FLOOR_BALANCE: float = float(os.getenv("ACCOUNT_FLOOR_BALANCE", 95000.0))

settings = Settings()
