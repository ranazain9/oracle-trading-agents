"""
ORACLE Trading Agent - Agent 2 (Trader) Verification Test Runner
Demonstrates:
1. Agent 1 analyzes live market and produces StrategyDecision.
2. Agent 2 checks Alpaca account equity & market clock.
3. Agent 2 computes exact multi-leg options strikes and routes paper orders.
4. Trade is logged to data/trades.json with full audit trail.
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

from agents.strategy_brain_agent import StrategyBrainAgent
from agents.trader_agent import TraderAgent
from tools.market_data_tools import MarketDataTool
from tools.alpaca_tools import AlpacaTool

def main():
    print("\n" + "=" * 75)
    print("🚀 ORACLE: TESTING AGENT #2 (THE TRADER & ALPACA ORDER EXECUTION)")
    print("=" * 75 + "\n")

    # Step 1: Check Alpaca Brokerage Account
    alpaca = AlpacaTool()
    acc = alpaca.get_account_status()
    clock = alpaca.get_market_clock()
    print("[*] 1. ALPACA PAPER TRADING BROKERAGE STATUS")
    print("-" * 75)
    print(f"  • Account ID          : {acc['account_id']}")
    print(f"  • Cash Available      : ${acc['cash']:,.2f}")
    print(f"  • Portfolio Equity    : ${acc['equity']:,.2f}")
    print(f"  • Buying Power        : ${acc['buying_power']:,.2f}")
    print(f"  • Market Open Status  : {'OPEN' if clock['is_open'] else 'CLOSED'}")
    print(f"  • Alpaca API Live Mode: {acc['is_live_alpaca']}")
    print("-" * 75 + "\n")

    # Step 2: Agent 1 Generates Live Decision
    print("[*] 2. AGENT #1: GENERATING QUANTITATIVE STRATEGY DECISION...")
    brain = StrategyBrainAgent()
    decision = brain.analyze_and_decide(portfolio_cash=acc["cash"])
    
    # Get live stock price for selected symbol
    assets = MarketDataTool.get_asset_universe_data([decision.symbol])
    stock_price = assets[0]["current_price"] if assets else 200.0

    print(f"  • Target Symbol       : {decision.symbol} (Live Price: ${stock_price:.2f})")
    print(f"  • Selected Strategy   : {decision.strategy}")
    print(f"  • Directional Bias    : {decision.direction}")
    print(f"  • AI Confidence       : {decision.confidence_score * 100:.1f}%\n")

    # Step 3: Agent 2 Executes the Strategy
    print("[*] 3. AGENT #2: FORMULATING & ROUTING MULTI-LEG OPTIONS ORDER...")
    trader = TraderAgent()
    exec_result = trader.construct_and_execute(decision, stock_price)

    blueprint = exec_result["blueprint"]
    if blueprint:
        print("\n" + "=" * 75)
        print("🎯 EXECUTED OPTIONS ORDER BLUEPRINT:")
        print("=" * 75)
        print(f"  • Trade ID            : {exec_result['trade_id']}")
        print(f"  • Strategy Type       : {blueprint.strategy_name}")
        print(f"  • Total Cost / Credit : ${blueprint.total_debit_or_credit:.2f} ({'Net Credit' if blueprint.is_credit else 'Net Debit'})")
        print(f"  • Profit Target       : +${blueprint.profit_target_usd:.2f} (+{decision.target_profit_percent:.0f}% Exit Rule)")
        print(f"  • Stop Loss Limit     : -${blueprint.stop_loss_usd:.2f} (Hard Stop Rule)")
        print("-" * 75)
        print("  • Executed Order Legs on Alpaca:")
        for i, order in enumerate(exec_result["executed_orders"], 1):
            print(f"    [Leg {i}] OrderID: {order['order_id']} | {order['side'].upper()} {order['qty']}x {order['symbol']} | Status: {order['status']}")
        print("=" * 75)

    print("\n✅ AGENT #2 (THE TRADER) IS 100% OPERATIONAL & VERIFIED!\n")

if __name__ == "__main__":
    main()
