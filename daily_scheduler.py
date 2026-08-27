"""
ORACLE Trading Agent - Autonomous Daily Market Daemon & Scheduler
Executes Agent 1 (Market Scout) and Agent 2 (The Trader) at 9:30 AM EST and logs daily audit trails to logs/.
"""
import os
import sys
import time
import datetime
from pathlib import Path

# Ensure UTF-8 output on Windows terminals
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

from agents.strategy_brain_agent import StrategyBrainAgent
from agents.trader_agent import TraderAgent
from tools.market_data_tools import MarketDataTool
from tools.alpaca_tools import AlpacaTool

class DailyScheduler:
    """
    Automated market clock listener and daily execution logger.
    """

    LOGS_DIR = BASE_DIR / "logs"

    def __init__(self):
        self.LOGS_DIR.mkdir(parents=True, exist_ok=True)
        self.alpaca = AlpacaTool()
        self.brain = StrategyBrainAgent()
        self.trader = TraderAgent()

    def run_daily_cycle(self) -> dict:
        """
        Executes the full morning 9:30 AM EST options analysis & order execution cycle.
        """
        today_str = datetime.date.today().isoformat()
        log_file = self.LOGS_DIR / f"agent1_daily_{today_str}.log"
        now_utc = datetime.datetime.utcnow().isoformat()

        print(f"\n[*] [DailyScheduler] Starting Autonomous Trading Day: {today_str} ({now_utc})")
        
        # 1. Market Clock & Account Check
        clock = self.alpaca.get_market_clock()
        account = self.alpaca.get_account_status()
        cash = account.get("cash", 100000.0)

        # 2. Agent 1: Market Scout & Strategy Brain
        print("[*] [DailyScheduler] Triggering Agent 1 Market Analysis...")
        decision = self.brain.analyze_and_decide(portfolio_cash=cash)

        # 3. Agent 2: The Trader (Order Execution)
        assets = MarketDataTool.get_asset_universe_data([decision.symbol])
        stock_price = assets[0]["current_price"] if assets else 200.0
        
        print(f"[*] [DailyScheduler] Triggering Agent 2 Execution for {decision.symbol} (${stock_price:.2f})...")
        exec_result = self.trader.construct_and_execute(decision, stock_price)

        # 4. Write Daily Structured Log File
        log_entry = (
            f"================================================================================\n"
            f"ORACLE DAILY EXECUTION LOG - {today_str} {now_utc}\n"
            f"================================================================================\n"
            f"Account ID          : {account.get('account_id')}\n"
            f"Portfolio Cash      : ${cash:,.2f}\n"
            f"Market Open Status  : {clock.get('is_open')}\n"
            f"--------------------------------------------------------------------------------\n"
            f"AGENT 1 DECISION:\n"
            f"  • Selected Symbol : {decision.symbol}\n"
            f"  • Strategy        : {decision.strategy}\n"
            f"  • Market Regime   : {decision.regime}\n"
            f"  • Direction Bias  : {decision.direction}\n"
            f"  • AI Confidence   : {decision.confidence_score * 100:.1f}%\n"
            f"  • Validator Status: {decision.validator_status}\n"
            f"  • Risk Budget     : ${decision.suggested_risk_budget_usd:.2f}\n"
            f"  • Profit Target   : +{decision.target_profit_percent:.0f}%\n"
            f"  • Stop Loss       : -${decision.max_loss_usd:.2f}\n"
            f"  • Reasoning       : {decision.reasoning}\n"
            f"--------------------------------------------------------------------------------\n"
            f"AGENT 2 EXECUTION:\n"
            f"  • Status          : {exec_result.get('status')}\n"
            f"  • Trade ID        : {exec_result.get('trade_id')}\n"
            f"  • Orders Count    : {len(exec_result.get('executed_orders', []))}\n"
            f"================================================================================\n\n"
        )

        with open(log_file, "a", encoding="utf-8") as f:
            f.write(log_entry)

        print(f"💾 [DailyScheduler] Daily execution logged to: {log_file}")

        return {
            "date": today_str,
            "decision": decision,
            "execution": exec_result,
            "log_path": str(log_file)
        }

if __name__ == "__main__":
    scheduler = DailyScheduler()
    scheduler.run_daily_cycle()
