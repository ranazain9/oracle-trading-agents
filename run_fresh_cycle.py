import sys
try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

from agents.orchestrator_agent import MasterOrchestratorAgent

def main():
    orch = MasterOrchestratorAgent()
    state = orch.run_market_open_execution()

    print("================================================================================")
    print("FRESH CLEAN AUTONOMOUS TRADE CYCLE COMPLETED!")
    print("================================================================================")
    print(f"• Selected Strategy : {state.get('selected_strategy')}")
    print(f"• Selected Symbol   : {state.get('selected_symbol')}")
    conf = float(state.get('confidence_score', 0.0) or 0.0)
    print(f"• Confidence Score  : {conf * 100:.1f}%")
    t_id = state.get('trade_execution_result', {}).get('trade_id', 'N/A')
    print(f"• Execution Trade ID: {t_id}")
    orders = state.get('execution_orders', [])
    print(f"• Formulated Orders : {len(orders)}")
    for o in orders:
        action = o.get('action', 'BUY')
        qty = o.get('qty', 1)
        occ = o.get('occ_symbol', '')
        limit_p = o.get('limit_price', 0.0)
        print(f"    - {action} {qty}x OCC:[{occ}] @ ${limit_p:.2f}")
    print("================================================================================")

if __name__ == "__main__":
    main()
