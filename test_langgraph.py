"""
ORACLE LangGraph State Machine Verification Test Runner
Demonstrates:
1. Compiling prebuilt LangGraph StateGraph (START -> Market Scout -> Strategy Brain -> Router -> Trader / Capital Preservation -> END)
2. Invoking the LangGraph application with an initial state
3. Inspecting full state transition and execution audit
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
    print("\n" + "=" * 80)
    print("🚀 ORACLE: MASTER LANGGRAPH STATE MACHINE EXECUTION")
    print("=" * 80 + "\n")

    initial_state = {
        "symbols": ["NVDA", "AAPL", "MSFT", "TSLA", "AMZN", "SPY"],
        "portfolio_cash": 100000.0,
        "is_approved": False,
        "decision": None,
        "execution_result": None
    }

    print("[*] Invoking Prebuilt LangGraph StateGraph Flow...")
    final_state = oracle_app.invoke(initial_state)

    print("\n" + "=" * 80)
    print("🎯 LANGGRAPH FINAL STATE AUDIT:")
    print("=" * 80)
    decision = final_state.get("decision")
    exec_res = final_state.get("execution_result")

    if decision:
        print(f"  • Selected Symbol       : {decision.symbol}")
        print(f"  • Strategy              : {decision.strategy}")
        print(f"  • Market Regime         : {decision.regime}")
        print(f"  • AI Confidence         : {decision.confidence_score * 100:.1f}%")
        print(f"  • Risk Validator Status : {decision.validator_status}")
        print(f"  • Strategic Reasoning   : {decision.reasoning}")
    
    if exec_res:
        print("-" * 80)
        print("  • LangGraph Execution Node Result:")
        print(f"    * Status: {exec_res.get('status')}")
        print(f"    * Trade ID: {exec_res.get('trade_id', 'N/A')}")
        print(f"    * Executed Orders Count: {len(exec_res.get('executed_orders', []))}")

    print("=" * 80)
    print("\n✅ PREBUILT LANGGRAPH STATE MACHINE EXECUTED SUCCESSFULLY!\n")

if __name__ == "__main__":
    main()
