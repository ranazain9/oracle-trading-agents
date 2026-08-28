"""
ORACLE LangGraph State Machine Verification Test Runner
Demonstrates:
1. Compiling prebuilt LangGraph StateGraph (START -> Market Scout -> Strategy Brain -> Router -> Trader -> Bodyguard -> END)
2. Invoking the 3-Agent LangGraph application with initial state
3. Inspecting full state transition and 3-agent execution audit
"""
import sys
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

from graph import oracle_app

def main():
    print("\n" + "=" * 80, flush=True)
    print("🚀 ORACLE: MASTER 3-AGENT LANGGRAPH STATE MACHINE EXECUTION", flush=True)
    print("=" * 80 + "\n", flush=True)

    initial_state = {
        "symbols": ["NVDA", "AAPL", "MSFT", "TSLA", "AMZN", "SPY"],
        "portfolio_cash": 100000.0,
        "is_approved": False,
        "decision": None,
        "execution_result": None,
        "guardian_result": None
    }

    print("[*] Invoking Prebuilt LangGraph 3-Agent StateGraph Flow...", flush=True)
    final_state = oracle_app.invoke(initial_state)

    print("\n" + "=" * 80, flush=True)
    print("🎯 LANGGRAPH 3-AGENT PIPELINE AUDIT:", flush=True)
    print("=" * 80, flush=True)
    decision = final_state.get("decision")
    exec_res = final_state.get("execution_result")
    guard_res = final_state.get("guardian_result")

    if decision:
        print(f"  • [Agent 1 Strategist] : {decision.symbol} ({decision.strategy}) | Status: {decision.validator_status}", flush=True)
        print(f"    * Reasoning         : {decision.reasoning}", flush=True)
    
    if exec_res:
        print("-" * 80, flush=True)
        print(f"  • [Agent 2 Trader]     : Status: {exec_res.get('status')} | Trade ID: {exec_res.get('trade_id', 'N/A')}", flush=True)
        print(f"    * Executed Orders   : {len(exec_res.get('executed_orders', []))} leg(s)", flush=True)

    if guard_res:
        print("-" * 80, flush=True)
        print(f"  • [Agent 3 Bodyguard]  : Positions Scanned: {guard_res.get('scanned_count', 0)} | Actions Taken: {len(guard_res.get('actions_taken', []))}", flush=True)

    print("=" * 80, flush=True)
    print("\n✅ MASTER 3-AGENT LANGGRAPH PIPELINE EXECUTED SUCCESSFULLY!\n", flush=True)

if __name__ == "__main__":
    main()
