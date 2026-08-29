"""
ORACLE Trading System - Pipeline Schemas
Request and response models for LangGraph state machine execution.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class PipelineRunRequest(BaseModel):
    """
    Request body to trigger a multi-agent trading execution run.
    """
    symbols: Optional[List[str]] = Field(
        default=["NVDA", "AAPL", "MSFT", "TSLA", "AMZN", "SPY"],
        description="Universe of tickers to analyze"
    )
    portfolio_cash: Optional[float] = Field(
        default=100000.0,
        description="Available cash for sizing calculations"
    )
    force_auto_approve: bool = Field(
        default=True,
        description="If True, skips manual HITL holding queue for automated execution"
    )


class PipelineRunResponse(BaseModel):
    """
    Immediate response acknowledging background pipeline trigger.
    """
    success: bool = True
    run_id: str
    status: str = "RUNNING"
    message: str = "LangGraph 8-node pipeline dispatched asynchronously."
    dispatched_at: str


class PipelineStatusResponse(BaseModel):
    """
    Real-time progress and active node status of the pipeline.
    """
    is_running: bool
    current_node: str
    progress_percentage: int
    latest_run_id: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    last_error: Optional[str] = None


class OracleStateResponse(BaseModel):
    """
    Complete state snapshot from the latest LangGraph execution cycle.
    """
    symbols: List[str] = []
    portfolio_cash: float = 100000.0
    macro_assessment: Optional[Dict[str, Any]] = None
    market_overview: Optional[Dict[str, Any]] = None
    decision: Optional[Dict[str, Any]] = None
    hitl_approval: Optional[Dict[str, Any]] = None
    execution_result: Optional[Dict[str, Any]] = None
    hedge_decision: Optional[Dict[str, Any]] = None
    guardian_result: Optional[Dict[str, Any]] = None
    analyst_reflection: Optional[Dict[str, Any]] = None
    is_approved: bool = False
