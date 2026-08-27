"""
ORACLE Trading Agent - Base Strategy Definition
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from pydantic import BaseModel

class OptionLeg(BaseModel):
    symbol: str
    option_type: str  # "CALL" or "PUT"
    strike: float
    expiration: str
    side: str  # "BUY" or "SELL"
    qty: int
    estimated_premium: float

class StrategyOrderBlueprint(BaseModel):
    strategy_name: str
    underlying_symbol: str
    current_stock_price: float
    legs: List[OptionLeg]
    total_debit_or_credit: float
    is_credit: bool
    max_risk_usd: float
    profit_target_usd: float
    stop_loss_usd: float

class BaseStrategy(ABC):
    """
    Abstract base class for quantitative options strategy formulation.
    """

    @abstractmethod
    def calculate_order(
        self,
        symbol: str,
        current_price: float,
        risk_budget_usd: float,
        target_profit_percent: float = 50.0,
        max_loss_usd: float = 150.0
    ) -> StrategyOrderBlueprint:
        pass
