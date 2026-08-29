import json
from pathlib import Path
from tools.alpaca_tools import AlpacaTool

def main():
    alpaca = AlpacaTool()
    positions = alpaca.get_open_positions()

    trades_file = Path('data/trades.json')
    trades = []
    if trades_file.exists():
        with open(trades_file, 'r') as f:
            trades = json.load(f)

    print("================================================================================")
    print("🔍 LIVE ACTIVE BROKER POSITIONS ON EXCHANGE (ALPACA)")
    print("================================================================================")
    if positions:
        for idx, p in enumerate(positions, 1):
            sym = p.get('symbol', 'N/A')
            qty = float(p.get('qty', 0))
            side = 'BUY (LONG)' if qty > 0 else 'SELL (SHORT)'
            abs_qty = abs(qty)
            curr_price = float(p.get('current_price', 0.0) or 0.0)
            mkt_val = float(p.get('market_value', 0.0) or 0.0)
            u_pl = float(p.get('unrealized_pl', 0.0) or 0.0)
            u_plpc = float(p.get('unrealized_plpc', 0.0) or 0.0)

            # Parse OCC Symbol e.g. AAPL260904C00320000 -> AAPL 2026-09-04 320 CALL
            occ_desc = sym
            try:
                if len(sym) >= 15:
                    ticker = sym[:-15]
                    exp_raw = sym[-15:-9]
                    opt_type = 'CALL' if sym[-9] == 'C' else 'PUT'
                    strike = float(sym[-8:]) / 1000.0
                    occ_desc = f"{ticker} | Exp: 20{exp_raw[:2]}-{exp_raw[2:4]}-{exp_raw[4:]} | Strike: ${strike:.2f} {opt_type}"
            except Exception:
                pass

            pnl_str = f"+${u_pl:.2f}" if u_pl >= 0 else f"-${abs(u_pl):.2f}"
            pct_str = f"+{u_plpc:.2f}%" if u_plpc >= 0 else f"{u_plpc:.2f}%"

            print(f"{idx}. {side} {abs_qty:.0f}x Contract(s)")
            print(f"   • Contract : {occ_desc}")
            print(f"   • OCC Code : {sym}")
            print(f"   • Value    : ${curr_price:.2f}/sh | Total Mkt Val: ${mkt_val:.2f}")
            print(f"   • Live P&L : {pnl_str} ({pct_str})")
            print("--------------------------------------------------------------------------------")
    else:
        print("No open positions on exchange.")

    print("\n================================================================================")
    print("📜 ACTIVE STRATEGY PACKAGES LOGGED IN MULTI-AGENT JOURNAL")
    print("================================================================================")
    open_trades = [t for t in trades if t.get('status') in ['OPEN', 'ACTIVE', 'OPEN_ACTIVE']]
    for t in open_trades:
        t_id = t.get("trade_id", "UNKNOWN")
        strat = t.get("strategy", "N/A")
        sym = t.get("symbol", "N/A")
        target = float(t.get("profit_target_usd", 0.0) or 0.0)
        stop = float(t.get("stop_loss_usd", 0.0) or 0.0)
        order_type = t.get("order_type", "LIMIT_MIDPOINT")
        slippage = float(t.get("slippage_saved_usd", 0.0) or 0.0)
        
        print(f"• Trade ID   : {t_id}")
        print(f"  Strategy   : {strat} on ${sym}")
        print(f"  Target     : +${target:.2f} | Stop Loss: -${stop:.2f}")
        print(f"  Order Type : {order_type} | Slippage Saved: +${slippage:.2f}")
        legs = t.get('legs', [])
        if legs:
            print("  Package Legs:")
            for l in legs:
                action = l.get("action", "BUY")
                ratio = l.get("ratio", 1)
                opt_type = l.get("option_type", "CALL")
                strike = l.get("strike", 0.0)
                occ = l.get("occ_symbol", "")
                print(f"    - {action} {ratio}x {opt_type} Strike ${strike} (OCC: {occ})")
        print("--------------------------------------------------------------------------------")

if __name__ == "__main__":
    main()
