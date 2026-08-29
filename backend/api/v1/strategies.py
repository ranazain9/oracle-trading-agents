"""
ORACLE Trading System - Alpha Strategies Router
Endpoints for strategy catalog, multi-leg blueprint calculations, direct execution, and wing rolling.
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any

from backend.schemas.strategy_schemas import (
    StrategyInfoSchema, StrategyOrderBlueprintSchema, CalculateStrategyRequest,
    ExecuteStrategyRequest, ExecutionResultSchema, RollWingRequest, RollWingResponse
)
from agents.trader_agent import TraderAgent
from agents.strategy_brain_agent import StrategyDecision
from tools.leg_roller_tools import OptionLegRoller
from tools.market_data_tools import MarketDataTool

router = APIRouter(prefix="/strategies", tags=["Alpha Strategies"])

STRATEGIES_CATALOG = [
    {
        "id": "EARNINGS_STRADDLE",
        "name": "Earnings Volatility Straddle",
        "category": "Volatility Expansion",
        "description": "Simultaneous Long ATM Call + Put prior to earnings catalysts to capitalize on market moves exceeding implied pricing.",
        "suitable_regime": "LOW_VOLATILITY_EXPANSION",
        "legs_count": 2
    },
    {
        "id": "THETA_IRON_CONDOR",
        "name": "Theta Iron Condor",
        "category": "Premium Collection",
        "description": "4-Leg defined-risk credit spread collecting time-decay (theta) in rangebound, low-drift environments.",
        "suitable_regime": "HIGH_VOLATILITY_THETA_DECAY",
        "legs_count": 4
    },
    {
        "id": "DIRECTIONAL_SPREAD",
        "name": "Directional Vertical Spread",
        "category": "Directional Alpha",
        "description": "Bull Call Debit Spread or Bear Put Debit Spread exploiting high conviction directional momentum.",
        "suitable_regime": "DIRECTIONAL_MOMENTUM",
        "legs_count": 2
    },
    {
        "id": "ZERO_DTE_MEAN_REVERSION",
        "name": "0DTE Intraday Mean Reversion",
        "category": "High-Gamma Intraday",
        "description": "Short-duration credit spread capturing fast morning theta decay on index ETFs (SPY/QQQ).",
        "suitable_regime": "INTRADAY_MEAN_REVERSION",
        "legs_count": 2
    },
    {
        "id": "CALENDAR_DIAGONAL_SPREAD",
        "name": "Calendar & Diagonal Spread",
        "category": "Term-Structure Arbitrage",
        "description": "Exploits term-structure backwardation by selling front-week theta and buying back-month vega.",
        "suitable_regime": "TERM_STRUCTURE_BACKWARDATION",
        "legs_count": 2
    },
    {
        "id": "WHEEL_INCOME_STRATEGY",
        "name": "Systematic Wheel Strategy",
        "category": "Yield Harvesting",
        "description": "Cash-Secured Put selling below market, transitioning to Covered Call writing upon assignment.",
        "suitable_regime": "VALUE_ACCUMULATION",
        "legs_count": 1
    },
    {
        "id": "BROKEN_WING_BUTTERFLY",
        "name": "Broken Wing Butterfly (BWB)",
        "category": "Asymmetric Convexity",
        "description": "3-Strike asymmetric butterfly with skipped outer wing to eliminate upside tail-risk.",
        "suitable_regime": "ASYMMETRIC_DIRECTIONAL",
        "legs_count": 3
    }
]


@router.get("/list", response_model=List[StrategyInfoSchema])
async def list_strategies():
    """
    Returns metadata, rules, and parameters for all 7 institutional strategy calculators.
    """
    return [StrategyInfoSchema(**s) for s in STRATEGIES_CATALOG]


@router.post("/calculate", response_model=StrategyOrderBlueprintSchema)
async def calculate_strategy_blueprint(req: CalculateStrategyRequest):
    """
    Formulates exact OCC multi-leg order blueprint with CBOE strike snapping and midpoint limits.
    """
    trader = TraderAgent()
    price = req.current_price
    if price is None:
        assets = MarketDataTool.get_asset_universe_data(symbols=[req.symbol], compute_deep_sentiment=False)
        price = assets[0]["current_price"] if assets else 225.0

    strat = req.strategy.upper()
    if strat == "EARNINGS_STRADDLE":
        bp = trader.straddle_calc.calculate_order(req.symbol, price, req.risk_budget_usd, req.target_profit_percent, req.max_loss_usd)
    elif strat == "THETA_IRON_CONDOR":
        bp = trader.condor_calc.calculate_order(req.symbol, price, req.risk_budget_usd, req.target_profit_percent, req.max_loss_usd)
    elif strat == "DIRECTIONAL_SPREAD":
        bp = trader.spread_calc.calculate_order(req.symbol, price, direction=req.direction or "BULLISH", risk_budget_usd=req.risk_budget_usd, target_profit_percent=req.target_profit_percent, max_loss_usd=req.max_loss_usd)
    elif strat in ["ZERO_DTE_MEAN_REVERSION", "0DTE_SPREAD"]:
        bp = trader.zero_dte_calc.calculate_order(req.symbol, price, direction=req.direction or "BULLISH", risk_budget_usd=req.risk_budget_usd, target_profit_percent=req.target_profit_percent, max_loss_usd=req.max_loss_usd)
    elif strat in ["CALENDAR_DIAGONAL_SPREAD", "CALENDAR_SPREAD"]:
        bp = trader.calendar_calc.calculate_order(req.symbol, price, direction=req.direction or "NEUTRAL", risk_budget_usd=req.risk_budget_usd, target_profit_percent=req.target_profit_percent, max_loss_usd=req.max_loss_usd)
    elif strat in ["WHEEL_INCOME_STRATEGY", "WHEEL_STRATEGY"]:
        bp = trader.wheel_calc.calculate_order(req.symbol, price, risk_budget_usd=req.risk_budget_usd, target_profit_percent=req.target_profit_percent, max_loss_usd=req.max_loss_usd)
    elif strat in ["BROKEN_WING_BUTTERFLY", "BWB"]:
        bp = trader.bwb_calc.calculate_order(req.symbol, price, direction=req.direction or "BULLISH", risk_budget_usd=req.risk_budget_usd, target_profit_percent=req.target_profit_percent, max_loss_usd=req.max_loss_usd)
    else:
        bp = trader.straddle_calc.calculate_order(req.symbol, price, req.risk_budget_usd)

    return StrategyOrderBlueprintSchema(**bp.model_dump())


@router.post("/execute", response_model=ExecutionResultSchema)
async def execute_strategy_directly(req: ExecuteStrategyRequest):
    """
    Calculates and directly executes an options strategy on Alpaca via TraderAgent.
    """
    trader = TraderAgent()
    assets = MarketDataTool.get_asset_universe_data(symbols=[req.symbol], compute_deep_sentiment=False)
    price = assets[0]["current_price"] if assets else 225.0

    mock_decision = StrategyDecision(
        symbol=req.symbol,
        strategy=req.strategy,
        direction=req.direction or "NEUTRAL",
        suggested_risk_budget_usd=req.risk_budget_usd,
        is_validated=True
    )
    exec_res = trader.construct_and_execute(mock_decision, price)
    
    bp_dict = exec_res.get("blueprint")
    bp_schema = StrategyOrderBlueprintSchema(**bp_dict) if bp_dict else None

    return ExecutionResultSchema(
        status=exec_res.get("status", "EXECUTED"),
        trade_id=exec_res.get("trade_id"),
        strategy=req.strategy,
        symbol=req.symbol,
        blueprint=bp_schema,
        orders_executed=exec_res.get("orders_executed", [])
    )


@router.post("/roll-wing", response_model=RollWingResponse)
async def calculate_wing_roll(req: RollWingRequest):
    """
    Calculates dynamic untested wing roll or defensive roll-out for an existing position.
    """
    price = req.current_stock_price or 225.0
    pos = req.current_position or {"symbol": req.symbol, "pnl_usd": 50.0}

    if req.roll_type.upper() == "ROLL_OUT_IN_TIME":
        res = OptionLegRoller.calculate_roll_out_in_time(pos, price)
    else:
        res = OptionLegRoller.calculate_wing_roll(pos, price)

    return RollWingResponse(
        roll_action=res.get("roll_action", "ROLL_UNTESTED_WING_INWARD"),
        symbol=req.symbol,
        details=res,
        rationale=res.get("rationale", "Wing roll calculated.")
    )
