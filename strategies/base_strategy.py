"""
ORACLE Trading Agent - Base Strategy Module
Defines the institutional Pydantic schema for Multi-Leg Options Blueprints with OCC formatting and Midpoint Limit Pricing.
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class OptionLeg(BaseModel):
    """
    Pydantic Schema for an Individual Option Contract Leg
    """
    symbol: str = Field(description="Underlying stock symbol")
    occ_symbol: str = Field(default="", description="Official 21-char OCC Option Identifier")
    option_type: str = Field(description="CALL or PUT")
    strike: float = Field(description="CBOE-snapped strike price")
    side: str = Field(description="BUY or SELL")
    qty: int = Field(default=1, description="Number of contracts")
    estimated_premium: float = Field(description="Estimated price per share")
    bid_price: float = Field(default=0.0, description="Natural market bid")
    ask_price: float = Field(default=0.0, description="Natural market ask")
    midpoint_limit_price: float = Field(default=0.0, description="Midpoint limit price per share")


class StrategyOrderBlueprint(BaseModel):
    """
    Pydantic Schema for the Complete Executable Multi-Leg Options Order
    """
    strategy_name: str
    underlying_symbol: str
    legs: List[OptionLeg]
    total_debit_or_credit: float
    is_credit: bool
    package_limit_price_usd: float = Field(default=0.0, description="Net Midpoint Limit Price for entire package")
    margin_requirement_usd: float = Field(default=0.0, description="Option spread margin collateral required")
    estimated_slippage_savings_usd: float = Field(default=0.0, description="Dollars saved vs market order")
    profit_target_usd: float
    stop_loss_usd: float
    order_type: str = Field(default="LIMIT_MIDPOINT", description="Order type: LIMIT_MIDPOINT")
    execution_notes: str


class BaseStrategy(ABC):
    """
    Abstract Base Class for Options Strategy Calculators
    """

    @abstractmethod
    def calculate_order(
        self,
        symbol: str,
        current_price: float,
        risk_budget_usd: float = 500.0,
        target_profit_percent: float = 50.0,
        max_loss_usd: float = 150.0,
        **kwargs
    ) -> StrategyOrderBlueprint:
        pass
