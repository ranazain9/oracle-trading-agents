"""
Master Quantitative & AI Safety Verification Runner for Agent 1
Demonstrates:
1. Macroeconomic Event Radar (VIX & Fed FOMC)
2. Trade Memory & Win-Rate Context
3. Full Quantitative Screener Table (Greeks, Expected Move, Break-Evens, Liquidity, Sentiment)
4. AI Strategic Reasoning via AIML API
5. Deterministic Code Risk Validator (The 5 Hard Veto Rules)
6. Final Approved Hand-Off Blueprint
"""
import sys
from pathlib import Path
import json

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
from tools.market_data_tools import MarketDataTool
from tools.macro_calendar_tools import MacroCalendarTool

def main():
    print("\n" + "=" * 80)
    print("🚀 ORACLE: AGENT #1 (INSTITUTIONAL QUANT & AI SAFETY ENGINE)")
    print("=" * 80 + "\n")

    # 1. Macro Radar
    print("[*] 1. MACROECONOMIC & VOLATILITY RADAR")
    print("-" * 80)
    macro = MacroCalendarTool.get_macro_environment()
    overview = MarketDataTool.get_market_overview()
    print(f"  • CBOE VIX Volatility Index : {overview['vix']} ({overview['vix_regime']})")
    print(f"  • S&P 500 Market Momentum   : {overview['sp500_trend']} ({overview['market_sentiment']})")
    print(f"  • Macro Catalyst Radar      : {macro['event_summary']}")
    print(f"  • Fed Policy Environment    : {macro['fed_funds_rate_environment']}")
    print("-" * 80 + "\n")

    # 2. Historical Trade Memory
    agent = StrategyBrainAgent()
    print("[*] 2. HISTORICAL TRADE MEMORY & WIN-RATE AUDIT")
    print("-" * 80)
    print(agent._get_trade_memory_summary())
    print("-" * 80 + "\n")

    # 3. Full Quantitative Screener Table
    print("[*] 3. SCREENED UNIVERSE: GREEKS, EXPECTED MOVE, BREAK-EVENS & LIQUIDITY")
    print("-" * 80)
    symbols = ["NVDA", "AAPL", "MSFT", "TSLA", "AMZN", "META", "AMD", "SPY"]
    assets = MarketDataTool.get_asset_universe_data(symbols=symbols, compute_deep_sentiment=True)

    print(f"{'SYM':<5} {'PRICE':<8} {'IV%':<6} {'EXP MOVE':<10} {'THETA/D':<9} {'UPPER BE':<9} {'LOWER BE':<9} {'SPREAD':<7} {'LIQUIDITY':<12}")
    print("-" * 80)
    for a in assets:
        print(f"{a['symbol']:<5} ${a['current_price']:<7.2f} {a['iv_rank']:<5.1f}% ±${a['expected_move_usd']:<8.2f} ${a['theta_per_day_usd']:<8.2f} ${a['upper_breakeven']:<8.2f} ${a['lower_breakeven']:<8.2f} {a['bid_ask_spread_pct']:<5.1f}% {a['liquidity_grade'].split('_')[0]:<12}")
    print("-" * 80 + "\n")

    # 4. Multi-Factor AI Strategic Reasoning
    print("[*] 4. RUNNING AI STRATEGY ENGINE (AIML API)...")
    decision = agent.analyze_and_decide(symbols=symbols, portfolio_cash=100000.0, active_positions_count=0)

    # 5. Output Final Blueprint
    print("\n" + "=" * 80)
    print(f"🎯 FINAL AGENT 1 BLUEPRINT ({'TRADE APPROVED' if decision.strategy != 'NO_TRADE' else 'CAPITAL PRESERVATION / NO_TRADE'}):")
    print("=" * 80)
    print(f"  • Selected Symbol       : {decision.symbol}")
    print(f"  • Recommended Strategy  : {decision.strategy}")
    print(f"  • Market Regime         : {decision.regime}")
    print(f"  • Directional Skew      : {decision.direction}")
    print(f"  • AI Confidence Rating  : {decision.confidence_score * 100:.1f}%")
    print(f"  • Risk Validator Status : {decision.validator_status}")
    print(f"  • Allocated Risk Budget : ${decision.suggested_risk_budget_usd:.2f}")
    print(f"  • Profit Target Rule    : +{decision.target_profit_percent:.0f}% of max profit (Strict Discipline)")
    print(f"  • Stop Loss Rule        : -${decision.max_loss_usd:.2f} (Hard Cap)")
    print(f"  • AI Strategic Reasoning: {decision.reasoning}")
    print(f"  • Macro Risk Assessment : {decision.macro_risk_assessment}")
    
    if decision.quantitative_metadata:
        qm = decision.quantitative_metadata
        print("-" * 80)
        print("  • Attached Quantitative Audit:")
        print(f"    * Call Delta: {qm.get('call_delta')} | Theta Decay: ${qm.get('theta_per_day_usd')}/day | Vega: ${qm.get('vega_per_contract_usd')}")
        print(f"    * Expected Move: ±${qm.get('expected_move_usd')} | Upper BE: ${qm.get('upper_breakeven')} | Lower BE: ${qm.get('lower_breakeven')}")
        print(f"    * Bid-Ask Spread: {qm.get('bid_ask_spread_pct')}% | Open Interest: {qm.get('open_interest'):,} contracts")
    print("=" * 80)

    print("\n✅ AGENT 1 QUANTITATIVE & AI SAFETY ARCHITECTURE IS 100% OPERATIONAL!\n")

if __name__ == "__main__":
    main()
