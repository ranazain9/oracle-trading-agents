"""
ORACLE Trading System - Portfolio & Risk Schemas
Schemas for account balances, live positions, and portfolio Greeks.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class AccountStatusSchema(BaseModel):
    """
    Account buying power, cash, and portfolio equity
    """
    cash: float
    equity: float
    buying_power: float
    daily_change_usd: Optional[float] = 0.0
    daily_change_pct: Optional[float] = 0.0
    last_equity: Optional[float] = None
    status: str
    is_paper: bool = True
    account_number: Optional[str] = None


class PositionSchema(BaseModel):
    """
    Individual open position (equity or option contract)
    """
    symbol: str
    qty: float
    current_price: float
    market_value: float
    unrealized_pl: float
    unrealized_plpc: float
    asset_class: str = "us_option"


class PortfolioGreeksSchema(BaseModel):
    """
    Aggregated portfolio Greek risk metrics
    """
    total_open_positions_count: int = 0
    total_portfolio_market_value_usd: float = 0.0
    net_portfolio_delta: float = 0.0
    net_portfolio_gamma: float = 0.0
    net_portfolio_theta_daily_usd: float = 0.0
    net_portfolio_vega_usd: float = 0.0
    spy_benchmark_price: float = 585.0
    requires_hedge: bool = False
    recommended_hedge_bias: str = "BALANCED"
    positions_detail: List[Dict[str, Any]] = []


class ClosePositionResponse(BaseModel):
    """
    Result of closing an individual position
    """
    symbol: str
    status: str = "CLOSED"
    success: bool = True
    timestamp: str = ""
    message: str = ""
    broker_response: Optional[Dict[str, Any]] = None


class KillSwitchRequest(BaseModel):
    """
    Payload required to trigger emergency liquidation
    """
    confirmation_code: str = Field(description="Must match 'CONFIRM_KILL_SWITCH'")
    reason: str = Field(default="Emergency desk liquidation")


class CloseAllPositionsResponse(BaseModel):
    """
    Result of emergency fund kill switch
    """
    success: bool
    positions_closed_count: int
    details: List[Dict[str, Any]] = []
    timestamp: str
