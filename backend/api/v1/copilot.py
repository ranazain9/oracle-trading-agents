"""
ORACLE Trading System - Copilot AI Chat API Endpoints
"""
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from agents.copilot_agent import copilot_agent

logger = logging.getLogger("oracle.api.copilot")

router = APIRouter()

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    text: str = Field(..., description="Message content")

class CopilotChatRequest(BaseModel):
    message: str = Field(..., description="Operator query or prompt")
    history: Optional[List[ChatMessage]] = Field(default=[], description="Recent conversation turns")

class CopilotChatResponse(BaseModel):
    reply: str = Field(..., description="AI response in markdown format")
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp")
    mode: str = Field(..., description="Generation mode: AI_LLM or QUANTITATIVE_HEURISTIC")
    context_included: bool = Field(default=True, description="Whether live RAG portfolio data was injected")

@router.post("/chat", response_model=CopilotChatResponse)
async def chat_with_copilot(req: CopilotChatRequest):
    """
    Engage in conversational intelligence with the ORACLE Quantitative Copilot.
    Injects real-time Alpaca balances, portfolio Greeks, active positions, and macro data.
    """
    try:
        history_dicts = [{"role": m.role, "text": m.text} for m in req.history] if req.history else []
        result = copilot_agent.chat(user_message=req.message, history=history_dicts)
        return CopilotChatResponse(
            reply=result["reply"],
            timestamp=result["timestamp"],
            mode=result["mode"],
            context_included=result["context_included"]
        )
    except Exception as e:
        logger.error(f"Error processing copilot chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))
