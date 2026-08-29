"""
ORACLE Trading System - Trade Ledger & Memory Schemas
Schemas for trade history, statistics, and long-term reflection memory.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class TradeRecordSchema(BaseModel):
    """
    Executed trade log from data/trades.json
    """
    trade_id: str
    symbol: str
    strategy: str
    status: str
    entry_date: str
    underlying_entry_price: float
    cost_or_credit_usd: float
    profit_target_usd: float
    stop_loss_usd: float
    exit_date: Optional[str] = None
    exit_price: Optional[float] = None
    pnl_usd: Optional[float] = None
    exit_reason: Optional[str] = None
    order_legs: List[Dict[str, Any]] = []


class TradeMemorySchema(BaseModel):
    """
    AI performance reflection entry from data/trade_memory.json
    """
    timestamp: str
    symbol: str
    strategy: str
    pnl_usd: float
    outcome: str
    primary_driver: str
    grade: str
    lesson: str


class TradeStatsSchema(BaseModel):
    """
    Fund performance statistics
    """
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate_percent: float
    cumulative_realized_pnl_usd: float
    profit_factor: float
    max_drawdown_percent: float
    sharpe_ratio: float
    ledger_source: str


class ExportRequest(BaseModel):
    """
    Export format request
    """
    format: str = Field(default="json", description="json or csv")
    include_memory: bool = True


class ExportResponse(BaseModel):
    """
    Export file download link or payload
    """
    format: str
    records_count: int
    content: str
