"""
ORACLE Trading System - Master Dashboard Aggregation Router
Single high-speed endpoint providing the entire state required by the frontend trading terminal.
"""
from fastapi import APIRouter
from typing import Dict, Any

from backend.services.dashboard_service import dashboard_cache

router = APIRouter(prefix="/dashboard", tags=["Dashboard Bootstrap"])


@router.get("/bootstrap")
def get_dashboard_bootstrap() -> Dict[str, Any]:
    """
    Returns the complete aggregated trading desk state (Account, Greeks, Positions, Universe,
    Macro, Hedge, Proposals, Stats, Trades, News, Strategies) in < 2ms directly from memory.
    """
    return dashboard_cache.get_bootstrap_data()
