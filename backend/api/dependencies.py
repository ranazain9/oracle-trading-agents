"""
ORACLE Trading System - API Dependencies
Provides singleton dependency injection for routers.
"""
from tools.alpaca_tools import AlpacaTool
from backend.services.pipeline_service import pipeline_service, PipelineRunnerService
from backend.services.hitl_service import hitl_service, HITLService
from backend.services.websocket_service import ws_manager, WebSocketManager


def get_alpaca_tool() -> AlpacaTool:
    return AlpacaTool()


def get_pipeline_service() -> PipelineRunnerService:
    return pipeline_service


def get_hitl_service() -> HITLService:
    return hitl_service


def get_ws_manager() -> WebSocketManager:
    return ws_manager
