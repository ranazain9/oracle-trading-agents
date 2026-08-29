from tools.alpaca_tools import AlpacaTool

def main():
    alpaca = AlpacaTool()
    account = alpaca.get_account_status()
    positions = alpaca.get_open_positions()

    initial_capital = 100000.0
    current_equity = float(account.get('equity', 100000.0))
    cash = float(account.get('cash', 100000.0))
    buying_power = float(account.get('buying_power', 200000.0))
    account_total_drawdown = current_equity - initial_capital

    total_gross_losses = 0.0
    total_gross_gains = 0.0
    net_positions_pnl = 0.0

    print("================================================================================")
    print("EXACT REAL-TIME BROKER DATA (ALPACA SECURITIES)")
    print("================================================================================")
    print(f"Starting Account Balance : ${initial_capital:,.2f}")
    print(f"Current Account Equity   : ${current_equity:,.2f}")
    print(f"Available Cash Balance   : ${cash:,.2f}")
    print(f"Buying Power             : ${buying_power:,.2f}")
    prefix = "+" if account_total_drawdown >= 0 else "-"
    print(f"Net Account P&L          : {prefix}${abs(account_total_drawdown):,.2f} ({(account_total_drawdown/initial_capital)*100:.2f}%)")
    print("--------------------------------------------------------------------------------")
    print("ALL INDIVIDUAL OPEN POSITIONS RIGHT NOW:")
    print("--------------------------------------------------------------------------------")

    for idx, p in enumerate(positions, 1):
        sym = p.get('symbol', 'N/A')
        qty = float(p.get('qty', 0))
        side = 'BUY (LONG)' if qty > 0 else 'SELL (SHORT)'
        mkt_val = float(p.get('market_value', 0.0))
        pl = float(p.get('unrealized_pl', 0.0))
        plpc = float(p.get('unrealized_plpc', 0.0))
        
        net_positions_pnl += pl
        if pl < 0:
            total_gross_losses += abs(pl)
        else:
            total_gross_gains += pl

        sign = "+" if pl >= 0 else "-"
        print(f"{idx}. [{sym}]")
        print(f"   Side: {side} {abs(qty):.0f}x | Market Value: ${mkt_val:,.2f}")
        print(f"   Unrealized P&L: {sign}${abs(pl):,.2f} ({sign}{abs(plpc):.2f}%)")
        print("--------------------------------------------------------------------------------")

    print("================================================================================")
    print("EXACT TOTALS BREAKDOWN:")
    print("================================================================================")
    print(f"• Total Gross Losses (Sum of all negative legs) : -${total_gross_losses:,.2f}")
    print(f"• Total Gross Gains  (Sum of all positive legs) : +${total_gross_gains:,.2f}")
    net_p = "+" if net_positions_pnl >= 0 else "-"
    print(f"• Net Open Positions Unrealized P&L             : {net_p}${abs(net_positions_pnl):,.2f}")
    acc_p = "+" if account_total_drawdown >= 0 else "-"
    print(f"• Total Account Net Drawdown vs $100,000.00     : {acc_p}${abs(account_total_drawdown):,.2f}")
    print("================================================================================")

if __name__ == "__main__":
    main()
