"""
ORACLE Trading System - Asynchronous LangGraph Pipeline Service
Executes the master 8-node LangGraph pipeline non-blockingly and tracks real-time progress.
"""
from typing import Dict, Any, List, Optional
import asyncio
import datetime
import uuid
from concurrent.futures import ThreadPoolExecutor

from graph import oracle_app
from backend.services.websocket_service import ws_manager
from backend.core.logging import logger


class PipelineRunnerService:
    """
    Manages background asynchronous execution of the LangGraph 8-node state machine.
    """

    def __init__(self):
        self.is_running: bool = False
        self.current_node: str = "IDLE"
        self.progress_pct: int = 0
        self.latest_state: Optional[Dict[str, Any]] = None
        self.latest_run_id: Optional[str] = None
        self.started_at: Optional[str] = None
        self.completed_at: Optional[str] = None
        self.last_error: Optional[str] = None
        self._executor = ThreadPoolExecutor(max_workers=2)

    def get_status(self) -> Dict[str, Any]:
        """Returns the current pipeline execution status."""
        return {
            "is_running": self.is_running,
            "current_node": self.current_node,
            "progress_percentage": self.progress_pct,
            "latest_run_id": self.latest_run_id,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "last_error": self.last_error
        }

    async def trigger_run_async(
        self,
        symbols: Optional[List[str]] = None,
        portfolio_cash: float = 100000.0,
        force_auto_approve: bool = True
    ) -> str:
        """
        Dispatches the LangGraph state machine in an asynchronous background task.
        """
        if self.is_running:
            return self.latest_run_id or "ALREADY_RUNNING"

        run_id = f"RUN-{uuid.uuid4().hex[:8].upper()}"
        self.latest_run_id = run_id
        self.is_running = True
        self.current_node = "macro_sentinel_node"
        self.progress_pct = 10
        self.started_at = datetime.datetime.utcnow().isoformat()
        self.completed_at = None
        self.last_error = None

        logger.info(f"Triggering LangGraph Execution Run: {run_id}")

        # Broadcast start event
        await ws_manager.broadcast_telemetry({
            "event_type": "PIPELINE_STARTED",
            "run_id": run_id,
            "timestamp": self.started_at,
            "symbols": symbols or ["NVDA", "AAPL", "MSFT", "TSLA", "AMZN", "SPY"],
            "progress_percentage": self.progress_pct
        })

        # Launch non-blocking background task
        asyncio.create_task(self._execute_pipeline(symbols, portfolio_cash, run_id))
        return run_id

    async def _execute_pipeline(
        self,
        symbols: Optional[List[str]],
        portfolio_cash: float,
        run_id: str
    ):
        """Worker executing LangGraph synchronously on thread pool while broadcasting events."""
        initial_state = {
            "symbols": symbols or ["NVDA", "AAPL", "MSFT", "TSLA", "AMZN", "SPY"],
            "portfolio_cash": portfolio_cash,
            "market_overview": {},
            "macro_env": {},
            "macro_assessment": None,
            "assets_data": [],
            "trade_memory": "",
            "decision": None,
            "validation": None,
            "hitl_approval": None,
            "execution_result": None,
            "hedge_decision": None,
            "guardian_result": None,
            "analyst_reflection": None,
            "is_approved": False
        }

        try:
            loop = asyncio.get_running_loop()
            
            # Execute on ThreadPool to avoid blocking FastAPI event loop
            final_state = await loop.run_in_executor(
                self._executor,
                oracle_app.invoke,
                initial_state
            )

            self.latest_state = final_state
            self.progress_pct = 100
            self.current_node = "COMPLETED"
            self.completed_at = datetime.datetime.utcnow().isoformat()
            self.is_running = False

            logger.info(f"LangGraph Run {run_id} completed successfully.")

            # Broadcast completion event
            decision = final_state.get("decision")
            await ws_manager.broadcast_telemetry({
                "event_type": "PIPELINE_COMPLETED",
                "run_id": run_id,
                "timestamp": self.completed_at,
                "progress_percentage": 100,
                "macro_regime": final_state.get("macro_assessment", {}).get("macro_regime"),
                "selected_symbol": decision.symbol if decision else "N/A",
                "selected_strategy": decision.strategy if decision else "N/A",
                "execution_status": final_state.get("execution_result", {}).get("status"),
                "is_approved": final_state.get("is_approved", False)
            })

        except Exception as e:
            self.is_running = False
            self.current_node = "ERROR"
            self.last_error = str(e)
            self.completed_at = datetime.datetime.utcnow().isoformat()
            logger.error(f"Error executing LangGraph run {run_id}: {e}")

            await ws_manager.broadcast_telemetry({
                "event_type": "PIPELINE_ERROR",
                "run_id": run_id,
                "timestamp": self.completed_at,
                "error": str(e)
            })


# Global Singleton
pipeline_service = PipelineRunnerService()
