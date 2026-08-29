"""
ORACLE Trading System - Common Schemas
Standard generic response envelopes and status responses.
"""
from typing import Any, Optional, Dict, Generic, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class GenericActionResponse(BaseModel):
    """
    Standard Response Envelope for Action Endpoints
    """
    success: bool = Field(default=True, description="Whether the operation succeeded")
    message: str = Field(default="Operation completed successfully.", description="Status message")
    timestamp: str = Field(default="", description="UTC ISO timestamp")
    data: Optional[Any] = Field(default=None, description="Optional payload")


class ErrorResponse(BaseModel):
    """
    Standard Error Envelope
    """
    success: bool = Field(default=False)
    error_code: str = Field(description="Machine-readable error identifier")
    detail: str = Field(description="Human-readable error explanation")
