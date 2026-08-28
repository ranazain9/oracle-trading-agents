"""
ORACLE Trading System - Master Orchestrator Agent (Fund COO & Central Command)
Orchestrates the 5-phase daily trading lifecycle across all agents:
1. Pre-Market Diagnostics (9:00 AM EST)
2. Market Open Strategy & Dispatch (9:30 AM EST via LangGraph StateGraph)
3. Intraday Active Risk Supervision (9:35 AM - 4:00 PM EST via Bodyguard)
4. Post-Market Wrap-Up & Reporting (4:30 PM EST)
5. Overnight Suspension
"""
import sys
import time
import json
import logging
import datetime
from pathlib import Path
from typing import Dict, Any, Optional

from tools.alpaca_tools import AlpacaTool
from tools.market_data_tools import MarketDataTool
from tools.macro_calendar_tools import MacroCalendarTool
from tools.circuit_breaker_tools import CircuitBreakerGuard
from agents.bodyguard_agent import BodyguardAgent
from graph import oracle_app

# Configure Fund Logger
LOGS_DIR = Path(__file__).resolve().parent.parent / "logs"
LOGS_DIR.mkdir(exist_ok=True)
logging.basicConfig(
    filename=str(LOGS_DIR / "oracle_fund.log"),
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)


class MasterOrchestratorAgent:
    """
    Fund Chief Operating Officer (COO) and Central Command Conductor.
    """

    def __init__(self):
        self.alpaca = AlpacaTool()
        self.bodyguard = BodyguardAgent()
        self.trades_file = Path(__file__).resolve().parent.parent / "data" / "trades.json"
        self.is_running = True

    def get_fund_status(self) -> Dict[str, Any]:
        """
        Retrieves real-time portfolio status from Alpaca Brokerage.
        """
        account = self.alpaca.get_account_status()
        positions = self.alpaca.get_open_positions()
        circuit = CircuitBreakerGuard.check_black_swan_circuit_breaker()
        overview = MarketDataTool.get_market_overview()

        return {
            "account_id": account.get("account_id", "UNKNOWN"),
            "cash_balance": account.get("cash", 100000.0),
            "portfolio_equity": account.get("equity", 100000.0),
            "buying_power": account.get("buying_power", 400000.0),
            "is_live_broker": account.get("is_live_alpaca", False),
            "open_positions_count": len(positions),
            "open_positions": positions,
            "vix_level": overview.get("vix", 14.5),
            "circuit_breaker_active": circuit.get("is_circuit_breaker_triggered", False),
            "timestamp": datetime.datetime.utcnow().isoformat()
        }

    def run_premarket_diagnostics(self) -> Dict[str, Any]:
        """
        Phase 1: 9:00 AM EST Pre-Market Readiness Check.
        """
        print("\n" + "=" * 80, flush=True)
        print("🌅 [ORCHESTRATOR: PHASE 1] EXECUTING PRE-MARKET READINESS DIAGNOSTICS...", flush=True)
        print("=" * 80, flush=True)

        status = self.get_fund_status()
        print(f"  • Broker Account ID      : {status['account_id']}", flush=True)
        print(f"  • Available Cash         : ${status['cash_balance']:,.2f}", flush=True)
        print(f"  • Portfolio Equity       : ${status['portfolio_equity']:,.2f}", flush=True)
        print(f"  • Alpaca API Live Mode   : {status['is_live_broker']}", flush=True)
        print(f"  • CBOE VIX Index         : {status['vix_level']:.1f}", flush=True)
        print(f"  • Active Open Positions  : {status['open_positions_count']}", flush=True)

        is_ready = status["portfolio_equity"] >= 95000.0 and not status["circuit_breaker_active"]
        print(f"  • Fund Pre-Flight Status : {'🟢 ALL SYSTEMS GO (READY FOR 9:30 AM)' if is_ready else '🔴 PRE-FLIGHT HOLD'}", flush=True)
        print("=" * 80, flush=True)

        logging.info(f"Pre-Market Diagnostics: Ready={is_ready}, Equity=${status['portfolio_equity']:,.2f}")
        return {"status": "READY" if is_ready else "HOLD", "details": status}

    def run_market_open_execution(self) -> Dict[str, Any]:
        """
        Phase 2: 9:30 AM EST Market Open Strategy & Execution Dispatch via LangGraph.
        """
        print("\n" + "=" * 80, flush=True)
        print("🚀 [ORCHESTRATOR: PHASE 2] 9:30 AM EST MARKET OPEN: INITIATING LANGGRAPH PIPELINE...", flush=True)
        print("=" * 80, flush=True)

        initial_state = {
            "universe": ["NVDA", "AAPL", "MSFT", "TSLA", "AMZN", "META", "AMD", "SPY"],
            "market_data": {},
            "selected_symbol": "",
            "recommended_strategy": "",
            "confidence_score": 0.0,
            "risk_budget_usd": 0.0,
            "target_profit_pct": 50.0,
            "max_loss_usd": 150.0,
            "reasoning": "",
            "risk_validation_status": "",
            "execution_orders": [],
            "trade_id": "",
            "trade_logged": False,
            "bodyguard_actions": [],
            "error_logs": []
        }

        final_state = oracle_app.invoke(initial_state)
        logging.info(f"Market Open Execution Completed: Symbol={final_state.get('selected_symbol')}, Strategy={final_state.get('recommended_strategy')}")
        return final_state

    def run_intraday_monitoring_step(self) -> Dict[str, Any]:
        """
        Phase 3: Intraday Active Risk Guardian Scan (Single Iteration).
        """
        return self.bodyguard.monitor_positions()

    def run_postmarket_summary(self) -> Dict[str, Any]:
        """
        Phase 4: 4:30 PM EST Post-Market Wrap-Up & Performance Aggregation.
        """
        print("\n" + "=" * 80, flush=True)
        print("📊 [ORCHESTRATOR: PHASE 4] 4:30 PM EST: GENERATING POST-MARKET FUND TEARSHEET...", flush=True)
        print("=" * 80, flush=True)

        status = self.get_fund_status()
        trades = []
        if self.trades_file.exists():
            try:
                with open(self.trades_file, "r") as f:
                    trades = json.load(f)
            except Exception:
                trades = []

        total_trades = len(trades)
        closed_trades = [t for t in trades if t.get("status") in ["CLOSED_PROFIT", "CLOSED_STOPPED", "CLOSED_0DTE_RISK"]]
        winners = [t for t in closed_trades if float(t.get("pnl_usd", 0)) > 0]
        win_rate = (len(winners) / len(closed_trades) * 100) if closed_trades else 0.0
        total_realized_pnl = sum(float(t.get("pnl_usd", 0)) for t in closed_trades)

        print(f"  • Total Trades Recorded : {total_trades}", flush=True)
        print(f"  • Closed Trades Today   : {len(closed_trades)}", flush=True)
        print(f"  • Realized Win Rate     : {win_rate:.1f}%", flush=True)
        print(f"  • Realized Total P&L    : {'+$' if total_realized_pnl >= 0 else '-$'}{abs(total_realized_pnl):,.2f}", flush=True)
        print(f"  • Ending Portfolio Value: ${status['portfolio_equity']:,.2f}", flush=True)
        print("=" * 80, flush=True)

        logging.info(f"Post-Market Summary: Realized PnL=${total_realized_pnl:,.2f}, WinRate={win_rate:.1f}%")
        return {
            "total_trades": total_trades,
            "closed_trades_count": len(closed_trades),
            "win_rate_pct": win_rate,
            "realized_pnl_usd": total_realized_pnl,
            "portfolio_equity": status["portfolio_equity"]
        }

    def run_full_cycle_now(self) -> Dict[str, Any]:
        """
        Executes a complete end-to-end cycle on demand right now.
        """
        print("\n" + "#" * 80, flush=True)
        print("⚡ [ORCHESTRATOR] EXECUTING ON-DEMAND FULL TRADING & RISK CYCLE...", flush=True)
        print("#" * 80, flush=True)

        diag = self.run_premarket_diagnostics()
        exec_state = self.run_market_open_execution()
        risk_state = self.run_intraday_monitoring_step()
        summary = self.run_postmarket_summary()

        return {
            "diagnostics": diag,
            "execution": exec_state,
            "risk_monitoring": risk_state,
            "summary": summary
        }

    def emergency_shutdown(self) -> Dict[str, Any]:
        """
        Emergency Portfolio Liquidation (Circuit Breaker Override).
        """
        print("\n🚨 [ORCHESTRATOR] INITIATING EMERGENCY LIQUIDATION PROTOCOL...", flush=True)
        res = self.alpaca.close_all_positions(cancel_orders=True)
        logging.warning("Emergency Liquidation Protocol Executed.")
        return {"status": "EMERGENCY_SHUTDOWN_COMPLETED", "result": res}
