"""
ORACLE Trading System - Backend Configuration Settings
Uses Pydantic v2 settings to manage environment variables, CORS, and server settings.
"""
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """
    Application Settings and Environment Configuration
    """
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "ORACLE Multi-Agent Options Fund API"
    VERSION: str = "2.0.0"
    DESCRIPTION: str = "Institutional Multi-Agent Options Trading Fund powered by LangGraph, Gemini & Alpaca."
    
    # Server Host & Port
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True

    # CORS Whitelist
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
        "*"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"


settings = Settings()
