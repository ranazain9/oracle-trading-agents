import json
from pathlib import Path
from tools.alpaca_tools import AlpacaTool

def main():
    alpaca = AlpacaTool()
    account = alpaca.get_account_status()
    positions = alpaca.get_open_positions()

    trades_file = Path('data/trades.json')
    trades = []
    if trades_file.exists():
        with open(trades_file, 'r') as f:
            trades = json.load(f)

    print("==================================================================")
    print("ORACLE MULTI-AGENT FUND - REAL-TIME P&L & PERFORMANCE REPORT")
    print("==================================================================")
    
    equity = float(account.get("equity", 100000.0))
    cash = float(account.get("cash", 100000.0))
    buying_power = float(account.get("buying_power", 200000.0))
    initial_capital = 100000.0
    net_gain = equity - initial_capital
    net_pct = (net_gain / initial_capital) * 100.0

    print(f"Starting Capital   : ${initial_capital:,.2f}")
    print(f"Current Equity     : ${equity:,.2f}")
    print(f"Available Cash     : ${cash:,.2f}")
    print(f"Buying Power       : ${buying_power:,.2f}")
    prefix = "+" if net_gain >= 0 else ""
    print(f"TOTAL NET GAIN/LOSS: {prefix}${net_gain:,.2f} ({prefix}{net_pct:.2f}%)")

    print("\n------------------------------------------------------------------")
    print("ACTIVE OPEN POSITIONS ON ALPACA")
    print("------------------------------------------------------------------")
    if positions:
        total_unrealized = 0.0
        for idx, p in enumerate(positions, 1):
            sym = p.get("symbol", "N/A")
            qty = float(p.get("qty", 0))
            side = "LONG (BUY)" if qty > 0 else "SHORT (SELL)"
            u_pnl = float(p.get("unrealized_pl", 0.0))
            u_pct = float(p.get("unrealized_plpc", 0.0))
            m_val = float(p.get("market_value", 0.0))
            total_unrealized += u_pnl
            u_prefix = "+" if u_pnl >= 0 else ""
            print(f"{idx}. [{sym}] {side} {abs(qty):.0f}x | P&L: {u_prefix}${u_pnl:,.2f} ({u_prefix}{u_pct:.2f}%) | Mkt Val: ${m_val:,.2f}")
        
        tot_prefix = "+" if total_unrealized >= 0 else ""
        print(f"\nNet Unrealized P&L Across Open Legs: {tot_prefix}${total_unrealized:,.2f}")
    else:
        print("No active open positions on exchange.")

    print("\n------------------------------------------------------------------")
    print("HISTORICAL TRADES JOURNAL")
    print("------------------------------------------------------------------")
    closed = [t for t in trades if t.get("status") in ["CLOSED", "EXECUTED_CLOSED", "LIQUIDATED"]]
    open_t = [t for t in trades if t.get("status") in ["OPEN", "ACTIVE", "OPEN_ACTIVE"]]
    
    print(f"Total Formulated Trades : {len(trades)}")
    print(f"Active Open in Journal  : {len(open_t)}")
    print(f"Closed Trades Count     : {len(closed)}")
    print("==================================================================")

if __name__ == "__main__":
    main()
