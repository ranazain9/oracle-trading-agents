"""
ORACLE Trading System - Agent Diagnostics Schemas
Request and response models for individual specialized agents.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class MacroAssessmentSchema(BaseModel):
    """
    Agent 4 Macro Intelligence output
    """
    macro_regime: str
    macro_shock_index: float
    macro_conviction_score: float
    max_allocation_multiplier: float
    strategic_macro_thesis: str
    raw_macro_data: Dict[str, Any] = {}


class BrainAnalysisRequest(BaseModel):
    """
    Direct on-demand request for StrategyBrainAgent reasoning
    """
    symbols: Optional[List[str]] = Field(default=["NVDA", "AAPL", "MSFT", "TSLA", "AMZN", "SPY"])
    portfolio_cash: float = 100000.0


class StrategyDecisionSchema(BaseModel):
    """
    Agent 1 Strategy Brain output
    """
    regime: str
    symbol: str
    strategy: str
    direction: str
    confidence_score: float
    reasoning: str
    macro_risk_assessment: str
    suggested_risk_budget_usd: float
    target_profit_percent: float
    max_loss_usd: float
    is_validated: bool
    validator_status: str
    fallback_used: bool
    red_team_critique: Dict[str, Any] = {}
    tot_scenario_data: Dict[str, Any] = {}
    quantitative_metadata: Dict[str, Any] = {}
    kelly_metadata: Dict[str, Any] = {}


class HedgeDecisionSchema(BaseModel):
    """
    Agent 5 Portfolio Hedge & Tail-Risk output
    """
    decision: str
    recommended_structure: str
    urgency_rating: str
    risk_commentary: str
    tail_risk_hedge_payload: Dict[str, Any] = {}
    portfolio_greeks: Dict[str, Any] = {}


class BodyguardScanResponse(BaseModel):
    """
    Agent 3 Active Risk Guardian scan result
    """
    scanned_count: int
    actions_taken: List[Dict[str, Any]] = []
    adaptive_sleep_seconds: int
    vix_circuit_status: Dict[str, Any] = {}
    zero_dte_status: Dict[str, Any] = {}
    timestamp: str


class TradeReflectionSchema(BaseModel):
    """
    Agent 6 Post-Trade Performance Analyst output
    """
    timestamp: str
    symbol: str
    strategy: str
    pnl_usd: float
    outcome: str
    primary_driver: str
    grade: str
    lesson: str
