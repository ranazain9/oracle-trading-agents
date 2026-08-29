"""
ORACLE Trading System - Strategy Schemas
Schemas for strategy calculations, order blueprints, and execution.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class StrategyInfoSchema(BaseModel):
    """
    Metadata for available strategies
    """
    id: str
    name: str
    category: str
    description: str
    suitable_regime: str
    legs_count: int


class OptionLegSchema(BaseModel):
    """
    Single option contract leg
    """
    symbol: str
    occ_symbol: str
    option_type: str
    strike: float
    side: str
    qty: int
    estimated_premium: float
    bid_price: float
    ask_price: float
    midpoint_limit_price: float


class StrategyOrderBlueprintSchema(BaseModel):
    """
    Complete executable multi-leg options blueprint
    """
    strategy_name: str
    underlying_symbol: str
    legs: List[OptionLegSchema]
    total_debit_or_credit: float
    is_credit: bool
    package_limit_price_usd: float
    margin_requirement_usd: float
    estimated_slippage_savings_usd: float
    profit_target_usd: float
    stop_loss_usd: float
    order_type: str
    execution_notes: str


class CalculateStrategyRequest(BaseModel):
    """
    Request body to calculate order blueprint
    """
    strategy: str = Field(default="THETA_IRON_CONDOR", description="Strategy identifier")
    symbol: str = Field(default="NVDA", description="Underlying ticker")
    current_price: Optional[float] = Field(default=None, description="Optional current price override")
    direction: Optional[str] = Field(default="NEUTRAL", description="BULLISH, BEARISH, or NEUTRAL")
    risk_budget_usd: float = Field(default=500.0, description="Risk budget in USD")
    target_profit_percent: float = Field(default=50.0, description="Target profit %")
    max_loss_usd: float = Field(default=150.0, description="Stop loss in USD")


class ExecuteStrategyRequest(BaseModel):
    """
    Request body to calculate and immediately submit to broker
    """
    strategy: str = Field(default="THETA_IRON_CONDOR")
    symbol: str = Field(default="NVDA")
    direction: Optional[str] = Field(default="NEUTRAL")
    risk_budget_usd: float = Field(default=500.0)


class ExecutionResultSchema(BaseModel):
    """
    Result of order execution
    """
    status: str
    trade_id: Optional[str] = None
    strategy: str
    symbol: str
    blueprint: Optional[StrategyOrderBlueprintSchema] = None
    orders_executed: List[Dict[str, Any]] = []


class RollWingRequest(BaseModel):
    """
    Request body to calculate an untested wing roll or defensive roll-out
    """
    symbol: str = "NVDA"
    roll_type: str = Field(default="WING_ROLL", description="WING_ROLL or ROLL_OUT_IN_TIME")
    current_stock_price: Optional[float] = None
    current_position: Optional[Dict[str, Any]] = None


class RollWingResponse(BaseModel):
    """
    Result of leg rolling calculation
    """
    roll_action: str
    symbol: str
    details: Dict[str, Any]
    rationale: str
