"""
ORACLE Trading System - Master API v1 Router
Aggregates all 7 sub-routers: pipeline, agents, hitl, portfolio, strategies, signals, trades.
"""
from fastapi import APIRouter

from backend.api.v1.pipeline import router as pipeline_router
from backend.api.v1.agents import router as agents_router
from backend.api.v1.hitl import router as hitl_router
from backend.api.v1.portfolio import router as portfolio_router
from backend.api.v1.strategies import router as strategies_router
from backend.api.v1.signals import router as signals_router
from backend.api.v1.trades import router as trades_router

api_v1_router = APIRouter()

api_v1_router.include_router(pipeline_router)
api_v1_router.include_router(agents_router)
api_v1_router.include_router(hitl_router)
api_v1_router.include_router(portfolio_router)
api_v1_router.include_router(strategies_router)
api_v1_router.include_router(signals_router)
api_v1_router.include_router(trades_router)
