"""
ORACLE Trading System - HITL Governance Schemas
Schemas for Human-in-the-Loop proposals, authorizations, and history.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class PendingApprovalSchema(BaseModel):
    """
    Trade proposal awaiting human sign-off
    """
    proposal_id: str
    symbol: str
    strategy: str
    direction: str
    suggested_risk_budget_usd: float
    confidence_score: float
    reasoning: str
    macro_regime: str
    created_at: str
    status: str = "PENDING_APPROVAL"


class HITLDecisionRequest(BaseModel):
    """
    Operator action payload for approve/reject
    """
    operator_name: str = Field(default="Head of Desk", description="Name/ID of operator authorizing the trade")
    notes: Optional[str] = Field(default="Authorized by risk desk", description="Operator comments")
    adjusted_budget_usd: Optional[float] = Field(default=None, description="Optional override budget")


class HITLDecisionResponse(BaseModel):
    """
    Response after human action
    """
    proposal_id: str
    is_approved: bool
    status: str
    operator_name: str
    operator_notes: str
    timestamp: str


class HITLHistorySchema(BaseModel):
    """
    Historical log of operator decisions
    """
    proposal_id: str
    symbol: str
    strategy: str
    decision: str
    operator: str
    timestamp: str
    notes: str
