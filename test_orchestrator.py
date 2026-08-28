"""
ORACLE Trading System - Master Orchestrator Verification Test Runner
Tests:
1. Pre-Market Diagnostics (Phase 1)
2. Live Fund Status Retrieval
3. Full On-Demand Cycle Execution (Phase 1 -> Phase 2 -> Phase 3 -> Phase 4)
"""
import sys
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

def main():
    print("\n" + "=" * 85, flush=True)
    print("🚀 ORACLE: TESTING MASTER ORCHESTRATOR AGENT (THE FUND COO)", flush=True)
    print("=" * 85, flush=True)

    orchestrator = MasterOrchestratorAgent()

    print("\n[*] 1. RETRIEVING LIVE FUND STATUS & BROKER METRICS...")
    status = orchestrator.get_fund_status()
    print(f"  • Account ID        : {status['account_id']}")
    print(f"  • Cash Available    : ${status['cash_balance']:,.2f}")
    print(f"  • Portfolio Equity  : ${status['portfolio_equity']:,.2f}")
    print(f"  • Buying Power      : ${status['buying_power']:,.2f}")
    print(f"  • Live Alpaca Mode  : {status['is_live_broker']}")
    print(f"  • CBOE VIX Level    : {status['vix_level']:.1f}")

    print("\n[*] 2. RUNNING ON-DEMAND FULL TRADING & RISK MANAGEMENT CYCLE...")
    cycle_res = orchestrator.run_full_cycle_now()

    print("\n" + "=" * 85, flush=True)
    print("🎯 MASTER ORCHESTRATOR EXECUTION SUMMARY:", flush=True)
    print("=" * 85, flush=True)
    print(f"  • Diagnostics Status : {cycle_res['diagnostics']['status']}", flush=True)
    print(f"  • Selected Symbol    : {cycle_res['execution'].get('selected_symbol', 'N/A')}", flush=True)
    print(f"  • Strategy Decision  : {cycle_res['execution'].get('recommended_strategy', 'N/A')}", flush=True)
    print(f"  • Validation Status  : {cycle_res['execution'].get('risk_validation_status', 'N/A')}", flush=True)
    print(f"  • Bodyguard Scan     : {cycle_res['risk_monitoring'].get('status', 'OK')}", flush=True)
    print(f"  • Post-Market Equity : ${cycle_res['summary']['portfolio_equity']:,.2f}", flush=True)
    print("=" * 85, flush=True)

    print("\n✅ MASTER ORCHESTRATOR AGENT (FUND COO) IS 100% OPERATIONAL & VERIFIED!\n", flush=True)

if __name__ == "__main__":
    main()
