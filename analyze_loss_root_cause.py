import json
import yfinance as yf
from pathlib import Path
from tools.alpaca_tools import AlpacaTool

def main():
    trades_file = Path('data/trades.json')
    hitl_file = Path('data/hitl_history.json')

    print("================================================================================")
    print("ORACLE MULTI-AGENT FUND - HISTORICAL LOSS ROOT CAUSE AUDIT")
    print("================================================================================")

    trades = []
    if trades_file.exists():
        with open(trades_file, 'r', encoding='utf-8') as f:
            trades = json.load(f)

    print(f"Total Journal Records: {len(trades)}\n")

    for idx, t in enumerate(trades, 1):
        tid = t.get('trade_id', 'N/A')
        sym = t.get('symbol', 'N/A')
        strat = t.get('strategy', 'N/A')
        status = t.get('status', 'N/A')
        entry_p = float(t.get('entry_price', 0.0) or 0.0)
        cost = float(t.get('cost_or_credit_usd', 0.0) or 0.0)
        reason = t.get('exit_reason', t.get('reasoning', 'N/A'))
        orders = t.get('execution_orders', t.get('orders', []))
        
        print(f"Trade #{idx}: [{tid}] {sym} - Strategy: {strat}")
        print(f"  * Status        : {status}")
        print(f"  * Underlying Px : ${entry_p:.2f}")
        print(f"  * Net Premium   : ${cost:.2f}")
        print(f"  * Orders Placed :")
        for o in orders:
            act = o.get('action', 'BUY')
            qty = o.get('qty', 1)
            occ = o.get('occ_symbol', '')
            lp = float(o.get('limit_price', 0.0) or 0.0)
            print(f"      - {act} {qty}x [{occ}] @ ${lp:.2f}")
        print(f"  * Exit / Log Note: {reason}")
        print("--------------------------------------------------------------------------------")

    print("\n================================================================================")
    print("MARKET & QUANTITATIVE ROOT CAUSE BREAKDOWN:")
    print("================================================================================")

if __name__ == "__main__":
    main()
