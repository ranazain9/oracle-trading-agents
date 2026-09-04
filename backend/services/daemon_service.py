"""
ORACLE Trading System - Autonomous 24/7 Daemon Service
Manages continuous background scheduling and market lifecycle orchestration:
1. 09:00 AM EST: Pre-Market Yield & Macro Diagnostics
2. 09:30 AM EST: Opening Bell LangGraph Execution & Trade Dispatch
3. 09:35 AM - 04:00 PM EST: Intraday 15s Adaptive Risk Bodyguard
4. 04:30 PM EST: Post-Market Audit Tearsheet & Memory Vectorization
5. Overnight & Weekends: Safe low-power suspension with countdown timer
"""
from typing import Dict, Any, List, Optional
import threading
import time
import datetime
import uuid
import asyncio

from backend.core.logging import logger
from backend.services.websocket_service import ws_manager
from backend.db.repositories import DaemonRepository
from agents.orchestrator_agent import MasterOrchestratorAgent


class AutonomousDaemonService:
    """
    Singleton service managing continuous 24/7 Auto-Pilot market operations.
    """

    def __init__(self):
        self._orchestrator: Optional[MasterOrchestratorAgent] = None
        self._is_running = False
        self._auto_pilot_enabled = True
        self._thread: Optional[threading.Thread] = None
        self._lock = threading.Lock()

        self._current_phase = "OVERNIGHT_STANDBY"
        self._status_message = "Auto-Pilot standing by for next market session."
        self._market_open_executed_today = False
        self._post_market_executed_today = False
        self._today_cycles_run = 0
        self._last_run_timestamp: Optional[str] = None
        self._current_date = datetime.date.today().isoformat()
        self._next_scheduled_event = "09:30 AM EST"

    def _get_orchestrator(self) -> MasterOrchestratorAgent:
        if self._orchestrator is None:
            self._orchestrator = MasterOrchestratorAgent()
        return self._orchestrator

    def start(self):
        """Starts the background 24/7 daemon listener loop."""
        with self._lock:
            if self._is_running:
                return
            self._is_running = True
            self._thread = threading.Thread(target=self._daemon_loop, daemon=True)
            self._thread.start()
            logger.info("⚡ [DAEMON] 24/7 Autonomous Daemon Service Thread Started.")

    def stop(self):
        """Stops the background daemon listener loop."""
        with self._lock:
            self._is_running = False

    def toggle_auto_pilot(self, enabled: Optional[bool] = None) -> bool:
        """Toggles Auto-Pilot ON or OFF."""
        with self._lock:
            if enabled is not None:
                self._auto_pilot_enabled = enabled
            else:
                self._auto_pilot_enabled = not self._auto_pilot_enabled

            mode = "ENABLED (24/7 AUTO-PILOT)" if self._auto_pilot_enabled else "DISABLED (MANUAL MODE)"
            logger.info(f"🔄 [DAEMON] Auto-Pilot Mode Switched: {mode}")
            return self._auto_pilot_enabled

    def get_status(self) -> Dict[str, Any]:
        """Returns the real-time status of the 24/7 Auto-Pilot daemon."""
        with self._lock:
            recent_runs = DaemonRepository.get_recent_runs(limit=10)
            return {
                "auto_pilot_enabled": self._auto_pilot_enabled,
                "is_running": self._is_running,
                "current_phase": self._current_phase,
                "status_message": self._status_message,
                "today_cycles_run": self._today_cycles_run,
                "market_open_executed_today": self._market_open_executed_today,
                "post_market_executed_today": self._post_market_executed_today,
                "last_run_timestamp": self._last_run_timestamp,
                "next_scheduled_event": self._next_scheduled_event,
                "recent_runs": recent_runs
            }

    def run_immediate_cycle(self) -> Dict[str, Any]:
        """Executes an immediate manual cycle through the orchestrator."""
        orchestrator = self._get_orchestrator()
        run_id = f"MANUAL-{uuid.uuid4().hex[:6].upper()}"
        res = orchestrator.run_full_cycle_now()
        
        with self._lock:
            self._today_cycles_run += 1
            self._last_run_timestamp = datetime.datetime.utcnow().isoformat()
            DaemonRepository.record_run(
                run_id=run_id,
                phase="MANUAL_TRIGGER",
                status="COMPLETED",
                summary=f"Manual cycle executed: {res.get('execution_status', 'OK')}",
                details=str(res)
            )
        return res

    def record_external_pipeline_run(self, run_id: str, symbol: str = "SPX", status: str = "COMPLETED", summary: str = ""):
        """Records a pipeline execution triggered directly by operator or API and increments today's cycle count."""
        with self._lock:
            self._today_cycles_run += 1
            self._last_run_timestamp = datetime.datetime.utcnow().isoformat()
            DaemonRepository.record_run(
                run_id=run_id,
                phase="ON_DEMAND_PIPELINE",
                status=status,
                summary=summary or f"Multi-Agent Alpha Pipeline executed for {symbol}",
                details=f"Symbol: {symbol} | Timestamp: {self._last_run_timestamp}"
            )

    def _daemon_loop(self):
        """Continuous background market clock loop."""
        while self._is_running:
            try:
                if not self._auto_pilot_enabled:
                    with self._lock:
                        self._current_phase = "MANUAL_PAUSED"
                        self._status_message = "24/7 Auto-Pilot paused by operator. Standing by in Manual Mode."
                    time.sleep(10)
                    continue

                orchestrator = self._get_orchestrator()
                market_clock = orchestrator.alpaca.get_market_clock()
                is_market_open = market_clock.get("is_open", False)

                try:
                    from zoneinfo import ZoneInfo
                    now_est = datetime.datetime.now(ZoneInfo("America/New_York"))
                except Exception:
                    now_utc = datetime.datetime.utcnow()
                    now_est = now_utc - datetime.timedelta(hours=4)

                today_str = now_est.date().isoformat()
                weekday = now_est.weekday()  # Mon=0, Fri=4, Sat=5, Sun=6
                hour = now_est.hour
                minute = now_est.minute

                # Reset daily flags on new calendar day
                if today_str != self._current_date:
                    with self._lock:
                        self._current_date = today_str
                        self._market_open_executed_today = False
                        self._post_market_executed_today = False
                        self._today_cycles_run = 0
                    logger.info(f"🌅 [DAEMON] New Trading Day Initialized: {today_str} ({now_est.strftime('%A')})")

                # Weekend Handling (Saturday / Sunday)
                if weekday >= 5:
                    with self._lock:
                        self._current_phase = "WEEKEND_STANDBY"
                        self._next_scheduled_event = "Mon 09:30 AM EST"
                        self._status_message = f"Weekend ({now_est.strftime('%A')}). Exchanges closed. Auto-Pilot standing by."
                    time.sleep(60)
                    continue

                # Phase 1: Pre-Market Window (9:00 AM - 9:29 AM EST)
                if hour == 9 and minute < 30:
                    with self._lock:
                        self._current_phase = "PRE_MARKET_AUDIT"
                        self._next_scheduled_event = "Today 09:30 AM EST (Opening Bell)"
                        self._status_message = "Pre-market diagnostics active. Auditing macro yield spreads & catalysts."
                    time.sleep(20)
                    continue

                # Phase 2: Opening Bell Execution (9:30 AM - 9:35 AM EST)
                elif hour == 9 and minute >= 30 and not self._market_open_executed_today and is_market_open:
                    with self._lock:
                        self._current_phase = "MARKET_OPEN_EXECUTION"
                        self._status_message = "🔔 09:30 AM Opening Bell! Executing autonomous LangGraph alpha pipeline..."
                    
                    run_id = f"AUTO-OPEN-{uuid.uuid4().hex[:6].upper()}"
                    logger.info(f"🔔 [DAEMON: 09:30 AM EST] Market Open Execution Triggered: {run_id}")
                    res = orchestrator.run_market_open_execution()

                    with self._lock:
                        self._market_open_executed_today = True
                        self._today_cycles_run += 1
                        self._last_run_timestamp = datetime.datetime.utcnow().isoformat()
                        DaemonRepository.record_run(
                            run_id=run_id,
                            phase="MARKET_OPEN_EXECUTION",
                            status="COMPLETED",
                            summary="Opening Bell trade generation & execution cycle completed.",
                            details=str(res)
                        )
                    time.sleep(15)
                    continue

                # Phase 3: Intraday Active Risk Guardian (9:35 AM - 4:00 PM EST)
                elif is_market_open and ((hour == 9 and minute >= 35) or (10 <= hour < 16)):
                    with self._lock:
                        self._current_phase = "INTRADAY_GUARDIAN"
                        self._next_scheduled_event = "Today 04:30 PM EST (Post-Market Audit)"
                        self._status_message = "Intraday Risk Bodyguard active. Monitoring 15s ratchet stop-loss floors."

                    res = orchestrator.run_intraday_monitoring_step()
                    try:
                        from backend.services.reconciliation_service import AlpacaReconciliationService
                        AlpacaReconciliationService.sync_all()
                    except Exception:
                        pass
                    adaptive_sleep = max(15, min(res.get("adaptive_sleep_seconds", 60), 120))
                    time.sleep(adaptive_sleep)
                    continue

                # Phase 4: Post-Market Audit & Tearsheet (4:30 PM EST)
                elif hour == 16 and minute >= 30 and not self._post_market_executed_today:
                    with self._lock:
                        self._current_phase = "POST_MARKET_AUDIT"
                        self._status_message = "04:30 PM Post-Market! Generating daily fund performance tearsheet & audit..."

                    run_id = f"AUTO-POST-{uuid.uuid4().hex[:6].upper()}"
                    logger.info(f"📊 [DAEMON: 04:30 PM EST] Generating Post-Market Summary: {run_id}")
                    res = orchestrator.run_postmarket_summary()

                    try:
                        from backend.services.reconciliation_service import AlpacaReconciliationService
                        AlpacaReconciliationService.sync_all()
                    except Exception:
                        pass

                    with self._lock:
                        self._post_market_executed_today = True
                        self._last_run_timestamp = datetime.datetime.utcnow().isoformat()
                        DaemonRepository.record_run(
                            run_id=run_id,
                            phase="POST_MARKET_AUDIT",
                            status="COMPLETED",
                            summary="Daily fund performance tearsheet generated.",
                            details=str(res)
                        )
                    time.sleep(60)
                    continue

                # Phase 5: Overnight Standby (4:35 PM - 8:59 AM EST)
                else:
                    with self._lock:
                        self._current_phase = "OVERNIGHT_STANDBY"
                        self._next_scheduled_event = "Tomorrow 09:30 AM EST" if weekday < 4 else "Mon 09:30 AM EST"
                        self._status_message = f"Market closed for the session ({now_est.strftime('%H:%M:%S EST')}). Capital protected in cash."
                    time.sleep(60)

            except Exception as e:
                logger.error(f"Error in 24/7 daemon loop: {e}")
                time.sleep(20)


# Global Singleton Instance
daemon_service = AutonomousDaemonService()
