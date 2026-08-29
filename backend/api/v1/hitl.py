"""
ORACLE Trading System - Human-In-The-Loop (HITL) Governance Router
Endpoints for reviewing pending high-capital proposals and recording operator sign-offs.
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List

from backend.schemas.hitl_schemas import (
    PendingApprovalSchema, HITLDecisionRequest, HITLDecisionResponse, HITLHistorySchema
)
from backend.services.hitl_service import HITLService
from backend.api.dependencies import get_hitl_service

router = APIRouter(prefix="/hitl", tags=["HITL Governance"])


@router.get("/pending", response_model=List[PendingApprovalSchema])
async def list_pending_proposals(
    hitl: HITLService = Depends(get_hitl_service)
):
    """
    Lists all pending trade proposals awaiting operator authorization.
    """
    return hitl.list_pending()


@router.get("/history", response_model=List[HITLHistorySchema])
async def list_approval_history(
    hitl: HITLService = Depends(get_hitl_service)
):
    """
    Returns historical operator decisions and overrides.
    """
    return hitl.list_history()


@router.post("/approve/{proposal_id}", response_model=HITLDecisionResponse)
async def approve_proposal(
    proposal_id: str,
    req: HITLDecisionRequest,
    hitl: HITLService = Depends(get_hitl_service)
):
    """
    Authorizes a pending trade proposal and releases it to the execution queue.
    """
    return hitl.approve(
        proposal_id=proposal_id,
        operator_name=req.operator_name,
        notes=req.notes or "Authorized by operator",
        adjusted_budget_usd=req.adjusted_budget_usd
    )


@router.post("/reject/{proposal_id}", response_model=HITLDecisionResponse)
async def reject_proposal(
    proposal_id: str,
    req: HITLDecisionRequest,
    hitl: HITLService = Depends(get_hitl_service)
):
    """
    Vetoes a pending trade proposal and triggers Capital Preservation mode.
    """
    return hitl.reject(
        proposal_id=proposal_id,
        operator_name=req.operator_name,
        notes=req.notes or "Vetoed by operator"
    )
