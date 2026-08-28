"""
ORACLE Trading System - Autonomous 24/7 Daily Market Daemon & Scheduler
Connects the Master Orchestrator Agent and LangGraph State Machine into a continuous, self-driving daily lifecycle:
1. 09:00 AM EST: Pre-Market Diagnostics & Account Health Check
2. 09:30 AM EST: Market Open Strategy Selection & Trade Dispatch (via LangGraph)
3. 09:35 AM - 04:00 PM EST: Intraday Active Risk Guardian (60s/15s Adaptive Loop via Bodyguard)
4. 04:30 PM EST: Post-Market Tearsheet & Performance Logging
5. Overnight: Safe suspension until next trading day
"""
import os
import sys
import time
import signal
import datetime
from pathlib import Path
from typing import Dict, Any

# Ensure UTF-8 output on Windows terminals
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

from agents.orchestrator_agent import MasterOrchestratorAgent


class DailyTradingDaemon:
    """
    24/7 Autonomous Daily Trading Daemon powered by the Master Orchestrator Agent.
    """

    def __init__(self):
        self.orchestrator = MasterOrchestratorAgent()
        self.is_running = True
        self.market_open_executed_today = False
        self.post_market_executed_today = False
        self.current_date = datetime.date.today().isoformat()

        # Handle graceful shutdown on Ctrl+C
        signal.signal(signal.SIGINT, self._handle_exit)
        signal.signal(signal.SIGTERM, self._handle_exit)

    def _handle_exit(self, signum, frame):
        print("\n\n🛑 [DAEMON] Graceful shutdown signal received. Stopping 24/7 daemon loop...")
        self.is_running = False
        sys.exit(0)

    def run_single_cycle(self) -> Dict[str, Any]:
        """
        Executes a full immediate on-demand cycle.
        """
        return self.orchestrator.run_full_cycle_now()

    def start(self, polling_interval_sec: int = 15):
        """
        Starts the continuous 24/7 market clock listener loop.
        """
        print("\n" + "=" * 80)
        print("🏛️  ORACLE 24/7 AUTONOMOUS DAILY TRADING DAEMON STARTED")
        print("=" * 80)
        print("  • Conductor       : Master Orchestrator Agent (Fund COO)")
        print("  • Operating Hours : 9:00 AM - 4:30 PM EST (Monday - Friday)")
        print("  • Intraday Guard  : 60s Base / 15s Adaptive Bodyguard Loop")
        print("  • Press Ctrl+C at any time to halt the daemon safely.")
        print("=" * 80 + "\n")

        while self.is_running:
            try:
                now_utc = datetime.datetime.utcnow()
                # US Eastern Time is UTC-4 (EDT) or UTC-5 (EST)
                now_est = now_utc - datetime.timedelta(hours=4)
                today_str = now_est.date().isoformat()
                weekday = now_est.weekday()  # 0=Mon, 4=Fri, 5=Sat, 6=Sun
                hour = now_est.hour
                minute = now_est.minute

                # Reset daily flags on new calendar day
                if today_str != self.current_date:
                    self.current_date = today_str
                    self.market_open_executed_today = False
                    self.post_market_executed_today = False
                    print(f"\n🌅 [DAEMON] New Trading Day Initialized: {today_str} ({now_est.strftime('%A')})")

                # Weekend Check (Saturday / Sunday)
                if weekday >= 5:
                    print(f"😴 [DAEMON] Weekend ({now_est.strftime('%A')}). Market Closed. Sleeping for 30 minutes...", end="\r", flush=True)
                    time.sleep(1800)
                    continue

                # Phase 1: 9:00 AM - 9:29 AM EST (Pre-Market Readiness)
                if hour == 9 and minute < 30:
                    print(f"🔍 [DAEMON] Pre-Market Window ({now_est.strftime('%H:%M:%S EST')}). Standing by for 9:30 AM open...", end="\r", flush=True)
                    time.sleep(30)
                    continue

                # Phase 2: 9:30 AM - 9:35 AM EST (Market Open Execution)
                elif hour == 9 and minute >= 30 and not self.market_open_executed_today:
                    print(f"\n🔔 [DAEMON: 9:30 AM EST] MARKET OPEN! Triggering LangGraph Strategy & Execution Pipeline...")
                    self.orchestrator.run_market_open_execution()
                    self.market_open_executed_today = True
                    time.sleep(10)
                    continue

                # Phase 3: 9:35 AM - 4:00 PM EST (Intraday Active Risk Guardian)
                elif (hour == 9 and minute >= 35) or (10 <= hour < 16):
                    res = self.orchestrator.run_intraday_monitoring_step()
                    adaptive_sleep = res.get("adaptive_sleep_seconds", 60)
                    print(f"🛡️ [DAEMON: INTRADAY] Bodyguard Active | Scan Interval: {adaptive_sleep}s | Time: {now_est.strftime('%H:%M:%S EST')}", end="\r", flush=True)
                    time.sleep(adaptive_sleep)
                    continue

                # Phase 4: 4:30 PM EST (Post-Market Summary & Tearsheet)
                elif hour == 16 and minute >= 30 and not self.post_market_executed_today:
                    print(f"\n📊 [DAEMON: 4:30 PM EST] MARKET CLOSED. Generating Daily Fund Tearsheet & Audit Log...")
                    self.orchestrator.run_postmarket_summary()
                    self.post_market_executed_today = True
                    time.sleep(60)
                    continue

                # Phase 5: 4:35 PM - 8:59 AM EST (Overnight Suspension)
                else:
                    print(f"🌙 [DAEMON] Market Closed ({now_est.strftime('%H:%M:%S EST')}). Standing by overnight...", end="\r", flush=True)
                    time.sleep(300)

            except Exception as e:
                print(f"\n[!] [DAEMON EXCEPTION] Recovering gracefully from error: {e}")
                time.sleep(polling_interval_sec)


# Backward Compatibility Alias
DailyScheduler = DailyTradingDaemon


if __name__ == "__main__":
    daemon = DailyTradingDaemon()
    daemon.start()
