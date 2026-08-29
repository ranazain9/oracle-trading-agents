"""
ORACLE Trading System - Agent Diagnostics Router
Direct endpoints for Macro Sentinel, Strategy Brain, Trader Simulation, Hedge Balancer, Bodyguard, and Analyst.
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any

from backend.schemas.agent_schemas import (
    MacroAssessmentSchema, BrainAnalysisRequest, StrategyDecisionSchema,
    HedgeDecisionSchema, BodyguardScanResponse, TradeReflectionSchema
)
from backend.schemas.strategy_schemas import StrategyOrderBlueprintSchema
from agents.macro_intelligence_agent import MacroIntelligenceAgent
from agents.strategy_brain_agent import StrategyBrainAgent
from agents.portfolio_hedge_agent import PortfolioHedgeAgent
from agents.bodyguard_agent import BodyguardAgent
from agents.post_trade_analyst_agent import PostTradeAnalystAgent
from agents.trader_agent import TraderAgent

router = APIRouter(prefix="/agents", tags=["Agent Diagnostics"])


@router.get("/macro", response_model=MacroAssessmentSchema)
def get_macro_assessment():
    """
    Agent 4 (Macro Sentinel): On-demand Treasury yield curve and Macro Shock Index (MSI) audit.
    """
    agent = MacroIntelligenceAgent()
    assessment = agent.evaluate_macro_regime()
    return MacroAssessmentSchema(**assessment.model_dump())


@router.post("/brain/decide", response_model=StrategyDecisionSchema)
async def query_strategy_brain(req: BrainAnalysisRequest):
    """
    Agent 1 (Strategy Brain): On-demand multi-turn Tree-of-Thoughts & Red Team strategy formulation.
    """
    macro_agent = MacroIntelligenceAgent()
    macro_assessment = macro_agent.evaluate_macro_regime()
    
    brain = StrategyBrainAgent()
    decision = brain.analyze_and_decide(
        symbols=req.symbols,
        portfolio_cash=req.portfolio_cash,
        macro_assessment=macro_assessment.model_dump()
    )
    return StrategyDecisionSchema(**decision.model_dump())


@router.post("/trader/simulate-order", response_model=StrategyOrderBlueprintSchema)
async def simulate_trader_order(decision_req: StrategyDecisionSchema):
    """
    Agent 2 (Trader Simulation): Formulates OCC option legs, midpoint limits, and margin checks without broker submission.
    """
    from agents.strategy_brain_agent import StrategyDecision
    decision = StrategyDecision(**decision_req.model_dump())
    
    trader = TraderAgent()
    # Mock current stock price based on strategy calculation
    from tools.market_data_tools import MarketDataTool
    assets = MarketDataTool.get_asset_universe_data(symbols=[decision.symbol], compute_deep_sentiment=False)
    price = assets[0]["current_price"] if assets else 225.0

    strat = decision.strategy.upper()
    if strat == "EARNINGS_STRADDLE":
        bp = trader.straddle_calc.calculate_order(decision.symbol, price, decision.suggested_risk_budget_usd)
    elif strat == "THETA_IRON_CONDOR":
        bp = trader.condor_calc.calculate_order(decision.symbol, price, decision.suggested_risk_budget_usd)
    elif strat == "DIRECTIONAL_SPREAD":
        bp = trader.spread_calc.calculate_order(decision.symbol, price, direction=decision.direction, risk_budget_usd=decision.suggested_risk_budget_usd)
    elif strat in ["ZERO_DTE_MEAN_REVERSION", "0DTE_SPREAD"]:
        bp = trader.zero_dte_calc.calculate_order(decision.symbol, price, direction=decision.direction, risk_budget_usd=decision.suggested_risk_budget_usd)
    elif strat in ["CALENDAR_DIAGONAL_SPREAD", "CALENDAR_SPREAD"]:
        bp = trader.calendar_calc.calculate_order(decision.symbol, price, direction=decision.direction, risk_budget_usd=decision.suggested_risk_budget_usd)
    elif strat in ["WHEEL_INCOME_STRATEGY", "WHEEL_STRATEGY"]:
        bp = trader.wheel_calc.calculate_order(decision.symbol, price, risk_budget_usd=decision.suggested_risk_budget_usd)
    elif strat in ["BROKEN_WING_BUTTERFLY", "BWB"]:
        bp = trader.bwb_calc.calculate_order(decision.symbol, price, direction=decision.direction, risk_budget_usd=decision.suggested_risk_budget_usd)
    else:
        bp = trader.straddle_calc.calculate_order(decision.symbol, price, decision.suggested_risk_budget_usd)

    return StrategyOrderBlueprintSchema(**bp.model_dump())


@router.get("/hedge/evaluate", response_model=HedgeDecisionSchema)
async def evaluate_portfolio_hedge():
    """
    Agent 5 (Portfolio Greek Balancer): Computes net portfolio Greeks and tail-risk hedge suggestions.
    """
    hedge_agent = PortfolioHedgeAgent()
    hedge_res = hedge_agent.evaluate_portfolio_hedge()
    return HedgeDecisionSchema(**hedge_res.model_dump())


@router.post("/bodyguard/scan", response_model=BodyguardScanResponse)
async def trigger_bodyguard_scan():
    """
    Agent 3 (Active Risk Guardian): Runs immediate 60-second position audit (+50% profit lock / -$150 stop loss).
    """
    bodyguard = BodyguardAgent()
    guard_res = bodyguard.monitor_positions()
    return BodyguardScanResponse(
        scanned_count=guard_res.get("scanned_count", 0),
        actions_taken=guard_res.get("actions_taken", []),
        adaptive_sleep_seconds=guard_res.get("adaptive_sleep_seconds", 60),
        vix_circuit_status=guard_res.get("vix_circuit_status", {}),
        zero_dte_status=guard_res.get("zero_dte_status", {}),
        timestamp=guard_res.get("timestamp", "")
    )


@router.get("/analyst/reflections", response_model=List[TradeReflectionSchema])
async def get_analyst_reflections():
    """
    Agent 6 (Post-Trade Performance Analyst): Returns last 50 AI trade reflections and lessons from disk.
    """
    import json
    from pathlib import Path
    memory_file = Path(__file__).resolve().parent.parent.parent.parent / "data" / "trade_memory.json"
    
    if not memory_file.exists():
        return []
    
    try:
        with open(memory_file, "r") as f:
            data = json.load(f)
            return [TradeReflectionSchema(**item) for item in data]
    except Exception:
        return []
