"""
ORACLE Trading System - Trade Ledger & Analytics Router
Endpoints for trade history, statistics, Sharpe ratio, and export.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List
from pathlib import Path
import json
import io
import csv

from backend.schemas.trade_schemas import (
    TradeRecordSchema, TradeMemorySchema, TradeStatsSchema, ExportRequest, ExportResponse
)
from backend.db.repositories import TradeRepository

router = APIRouter(prefix="/trades", tags=["Trade Ledger & Memory"])

DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "data"
MEMORY_FILE = DATA_DIR / "trade_memory.json"


@router.get("/history", response_model=List[TradeRecordSchema])
async def get_trade_history():
    """
    Returns live executed trade records directly from SQLite database.
    """
    trades = TradeRepository.get_all_trades()
    result = []
    for t in trades:
        result.append(TradeRecordSchema(
            trade_id=t.get("trade_id", "UNKNOWN"),
            symbol=t.get("symbol", "NVDA"),
            strategy=t.get("strategy", "EARNINGS_STRADDLE"),
            status=t.get("status", "OPEN"),
            entry_date=t.get("entry_date", ""),
            underlying_entry_price=float(t.get("entry_price", t.get("underlying_entry_price", 100.0))),
            cost_or_credit_usd=float(t.get("cost_or_credit_usd", 500.0)),
            profit_target_usd=float(t.get("profit_target_usd", 250.0)),
            stop_loss_usd=float(t.get("stop_loss_usd", 150.0)),
            exit_date=t.get("exit_date"),
            exit_price=t.get("exit_price"),
            pnl_usd=t.get("pnl_usd"),
            exit_reason=t.get("exit_reason"),
            order_legs=t.get("order_legs", [])
        ))
    return result


@router.get("/memory", response_model=List[TradeMemorySchema])
async def get_trade_memory():
    """
    Returns long-term AI performance reflections and lessons from data/trade_memory.json.
    """
    if not MEMORY_FILE.exists():
        return []
    try:
        with open(MEMORY_FILE, "r") as f:
            data = json.load(f)
            return [TradeMemorySchema(**item) for item in data]
    except Exception:
        return []


@router.get("/stats", response_model=TradeStatsSchema)
async def get_trade_stats():
    """
    Computes fund win rate, cumulative realized PnL, profit factor, max drawdown, and Sharpe ratio directly from SQLite.
    """
    stats = TradeRepository.get_trade_statistics()
    return TradeStatsSchema(
        total_trades=stats["total_trades"],
        winning_trades=stats["winning_trades"],
        losing_trades=stats["losing_trades"],
        win_rate_percent=stats["win_rate_percent"],
        cumulative_realized_pnl_usd=stats["cumulative_realized_pnl_usd"],
        profit_factor=stats["profit_factor"],
        max_drawdown_percent=stats["max_drawdown_percent"],
        sharpe_ratio=stats["sharpe_ratio"],
        ledger_source="SQLITE_DATABASE"
    )


@router.post("/export", response_model=ExportResponse)
async def export_trades(req: ExportRequest):
    """
    Exports trade execution records and memory as formatted JSON or CSV string from SQLite.
    """
    trades = TradeRepository.get_all_trades()

    fmt = req.format.lower()
    if fmt == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["trade_id", "symbol", "strategy", "status", "cost_usd", "pnl_usd", "exit_reason"])
        for t in trades:
            writer.writerow([
                t.get("trade_id", ""),
                t.get("symbol", ""),
                t.get("strategy", ""),
                t.get("status", ""),
                t.get("cost_or_credit_usd", 0),
                t.get("pnl_usd", 0),
                t.get("exit_reason", "")
            ])
        content = output.getvalue()
    else:
        content = json.dumps(trades, indent=2)

    return ExportResponse(
        format=fmt,
        records_count=len(trades),
        content=content
    )


@router.post("/sync")
async def sync_alpaca_trades():
    """
    On-demand broker reconciliation endpoint.
    Pulls live open positions & closed orders from Alpaca and syncs them directly into SQLite and trades.json.
    """
    try:
        from backend.services.reconciliation_service import AlpacaReconciliationService
        result = AlpacaReconciliationService.sync_all()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Broker sync failed: {str(e)}")

