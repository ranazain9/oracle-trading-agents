"""
ORACLE Trading System - Pipeline Orchestration Router
Endpoints for asynchronous LangGraph execution, status, and state inspection.
"""
from fastapi import APIRouter, Depends, HTTPException
import datetime

from backend.schemas.pipeline_schemas import (
    PipelineRunRequest, PipelineRunResponse, PipelineStatusResponse, OracleStateResponse
)
from backend.schemas.common import GenericActionResponse
from backend.services.pipeline_service import PipelineRunnerService
from backend.api.dependencies import get_pipeline_service

router = APIRouter(prefix="/pipeline", tags=["Pipeline Orchestration"])


@router.post("/run", response_model=PipelineRunResponse)
async def trigger_pipeline_run(
    req: PipelineRunRequest,
    pipeline: PipelineRunnerService = Depends(get_pipeline_service)
):
    """
    Triggers an asynchronous 8-node LangGraph execution cycle.
    """
    now = datetime.datetime.utcnow().isoformat()
    run_id = await pipeline.trigger_run_async(
        symbols=req.symbols,
        portfolio_cash=req.portfolio_cash or 100000.0,
        force_auto_approve=req.force_auto_approve
    )

    return PipelineRunResponse(
        success=True,
        run_id=run_id,
        status="RUNNING" if pipeline.is_running else "COMPLETED",
        message="LangGraph 8-node institutional pipeline dispatched.",
        dispatched_at=now
    )


@router.get("/status", response_model=PipelineStatusResponse)
async def get_pipeline_status(
    pipeline: PipelineRunnerService = Depends(get_pipeline_service)
):
    """
    Returns the real-time execution status and progress of the pipeline.
    """
    status = pipeline.get_status()
    return PipelineStatusResponse(**status)


@router.post("/cancel", response_model=GenericActionResponse)
async def cancel_pipeline_run(
    pipeline: PipelineRunnerService = Depends(get_pipeline_service)
):
    """
    Cancels or halts an ongoing pipeline execution.
    """
    now = datetime.datetime.utcnow().isoformat()
    if pipeline.is_running:
        pipeline.is_running = False
        pipeline.current_node = "CANCELLED_BY_OPERATOR"
        return GenericActionResponse(
            success=True,
            message="Pipeline execution halted by operator.",
            timestamp=now
        )
    return GenericActionResponse(
        success=True,
        message="No active pipeline run to cancel.",
        timestamp=now
    )


@router.get("/latest-state", response_model=OracleStateResponse)
async def get_latest_state(
    pipeline: PipelineRunnerService = Depends(get_pipeline_service)
):
    """
    Returns the complete serialized state dictionary from the latest pipeline execution.
    """
    if not pipeline.latest_state:
        return OracleStateResponse()

    state = pipeline.latest_state
    decision = state.get("decision")
    decision_dict = decision.model_dump() if hasattr(decision, "model_dump") else (decision if isinstance(decision, dict) else None)

    return OracleStateResponse(
        symbols=state.get("symbols", []),
        portfolio_cash=state.get("portfolio_cash", 100000.0),
        macro_assessment=state.get("macro_assessment"),
        market_overview=state.get("market_overview"),
        decision=decision_dict,
        hitl_approval=state.get("hitl_approval"),
        execution_result=state.get("execution_result"),
        hedge_decision=state.get("hedge_decision"),
        guardian_result=state.get("guardian_result"),
        analyst_reflection=state.get("analyst_reflection"),
        is_approved=state.get("is_approved", False)
    )
