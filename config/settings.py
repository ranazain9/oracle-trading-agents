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
    # Multi-Provider LLM Configuration (groq / gemini / hybrid / aimlapi)
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "groq").lower().strip('\"\'')

    # Groq LPU Configuration (Ultra-Fast 120B Reasoning)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "").strip('\"\'')
    GROQ_BASE_URL: str = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

    # Google Gemini Configuration (Massive 1M Context Window)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip('\"\'')
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-flash-latest")

    # AIML API Configuration (Preserved Fallback)
    AIML_API_KEY: str = (os.getenv("AIMLAPI_API_KEY") or os.getenv("AIML_API_KEY", "")).strip('\"\'')
    AIML_BASE_URL: str = os.getenv("AIML_BASE_URL", "https://api.aimlapi.com/v1")
    AI_MODEL: str = os.getenv("AI_MODEL", "openai/gpt-4o-mini")

    def get_active_llm_config(self, agent_type: str = "general") -> dict:
        """
        Dynamically routes LLM credentials and endpoints based on LLM_PROVIDER
        and agent workload requirements.
        """
        provider = self.LLM_PROVIDER
        if provider == "hybrid":
            if agent_type in ["macro", "strategy"]:
                return {
                    "provider": "gemini",
                    "api_key": self.GEMINI_API_KEY,
                    "base_url": "https://generativelanguage.googleapis.com/v1beta",
                    "model": self.GEMINI_MODEL
                }
            return {
                "provider": "groq",
                "api_key": self.GROQ_API_KEY,
                "base_url": self.GROQ_BASE_URL,
                "model": self.GROQ_MODEL
            }
        elif provider == "gemini":
            return {
                "provider": "gemini",
                "api_key": self.GEMINI_API_KEY,
                "base_url": "https://generativelanguage.googleapis.com/v1beta",
                "model": self.GEMINI_MODEL
            }
        elif provider == "aimlapi":
            return {
                "provider": "aimlapi",
                "api_key": self.AIML_API_KEY,
                "base_url": self.AIML_BASE_URL,
                "model": self.AI_MODEL
            }
        else:
            # Default to Groq 120B
            return {
                "provider": "groq",
                "api_key": self.GROQ_API_KEY,
                "base_url": self.GROQ_BASE_URL,
                "model": self.GROQ_MODEL
            }

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
