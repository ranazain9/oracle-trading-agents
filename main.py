"""
ORACLE Trading System - Master Command Center (Interactive CLI Entry Point)
Usage:
  python main.py             -> Launches interactive CLI Fund Command Center
  python main.py --run-now   -> Executes full on-demand fund cycle immediately
  python main.py --daemon    -> Launches 24/7 autonomous daily trading daemon
  python main.py --status    -> Displays current portfolio status
"""
import sys
import time
import argparse
from pathlib import Path

# Ensure UTF-8 output on Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

from agents.orchestrator_agent import MasterOrchestratorAgent


def print_banner():
    banner = r"""
  ___  ____    _    ____ _     _____ 
 / _ \|  _ \  / \  / ___| |   | ____|
| | | | |_) |/ _ \| |   | |   |  _|  
| |_| |  _ </ ___ \ |___| |___| |___ 
 \___/|_| \_\_/   \_\____|_____|_____|
  AUTONOMOUS AI OPTIONS HEDGE FUND
    """
    print("=" * 80)
    print(banner)
    print("  • Architecture : 5-Agent Multi-Turn ToT + Asymmetric Red Team Engine")
    print("  • Broker Status: Alpaca Live Paper Trading Connection (Active)")
    print("=" * 80)


def interactive_menu():
    orchestrator = MasterOrchestratorAgent()

    while True:
        print("\n" + "─" * 80)
        print("🏛️  ORACLE FUND COMMAND CENTER MENU:")
        print("─" * 80)
        print("  [1] 📊 Display Live Fund Status & Portfolio Equity")
        print("  [2] 🚀 Run Full On-Demand Trading Cycle (Agent 1 + Agent 2 + Agent 3)")
        print("  [3] 🛡️ Run Agent 3 Active Risk Guardian Scan Now")
        print("  [4] 📈 Generate Post-Market Fund Performance Summary")
        print("  [5] ⏰ Launch 24/7 Autonomous Daily Trading Daemon")
        print("  [6] 🚨 EMERGENCY CIRCUIT BREAKER: Liquidate All Positions")
        print("  [0] 🚪 Exit Command Center")
        print("─" * 80)

        choice = input("\n👉 Enter Selection [0-6]: ").strip()

        if choice == "1":
            status = orchestrator.get_fund_status()
            print("\n📊 LIVE PORTFOLIO STATUS:")
            print(f"  • Account ID          : {status['account_id']}")
            print(f"  • Cash Balance        : ${status['cash_balance']:,.2f}")
            print(f"  • Portfolio Equity    : ${status['portfolio_equity']:,.2f}")
            print(f"  • Buying Power        : ${status['buying_power']:,.2f}")
            print(f"  • Live Alpaca Mode    : {status['is_live_broker']}")
            print(f"  • Open Positions      : {status['open_positions_count']}")
            print(f"  • CBOE VIX Level      : {status['vix_level']:.1f}")
            print(f"  • Circuit Breaker     : {'TRIGGERED' if status['circuit_breaker_active'] else 'NOMINAL'}")

        elif choice == "2":
            orchestrator.run_full_cycle_now()

        elif choice == "3":
            orchestrator.run_intraday_monitoring_step()

        elif choice == "4":
            orchestrator.run_postmarket_summary()

        elif choice == "5":
            print("\n⏰ Launching 24/7 Autonomous Daily Daemon (Press Ctrl+C to stop)...")
            from daily_scheduler import DailyTradingDaemon
            daemon = DailyTradingDaemon()
            daemon.start()

        elif choice == "6":
            confirm = input("⚠️ Are you sure you want to LIQUIDATE ALL POSITIONS? (yes/no): ").strip().lower()
            if confirm in ["yes", "y"]:
                orchestrator.emergency_shutdown()
            else:
                print("Emergency liquidation cancelled.")

        elif choice == "0":
            print("\n👋 Exiting ORACLE Command Center. System standing by.\n")
            break

        else:
            print("[!] Invalid selection. Please enter a number between 0 and 6.")


def main():
    parser = argparse.ArgumentParser(description="ORACLE Master Command Center")
    parser.add_argument("--run-now", action="store_true", help="Execute full on-demand cycle immediately")
    parser.add_argument("--daemon", action="store_true", help="Start 24/7 autonomous daily trading daemon")
    parser.add_argument("--status", action="store_true", help="Display live fund status and exit")

    args = parser.parse_args()
    print_banner()

    orchestrator = MasterOrchestratorAgent()

    if args.run_now:
        orchestrator.run_full_cycle_now()
    elif args.daemon:
        from daily_scheduler import DailyTradingDaemon
        DailyTradingDaemon().start()
    elif args.status:
        st = orchestrator.get_fund_status()
        print(f"\nPortfolio Equity: ${st['portfolio_equity']:,.2f} | Cash: ${st['cash_balance']:,.2f} | VIX: {st['vix_level']:.1f}\n")
    else:
        interactive_menu()


if __name__ == "__main__":
    main()
